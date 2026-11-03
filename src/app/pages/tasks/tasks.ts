import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Task, TaskFields } from '../../models/task';
import { LayoutService } from '../../services/layout.service';
import { TaskService } from '../../services/task.service';
import { CATEGORIES } from '../../utils/constants';
import { getTaskStatus } from '../../utils/task-status';
import { TaskForm } from '../../components/task-form/task-form';
import { TaskList } from '../../components/task-list/task-list';
import { ToastNotification } from '../../components/toast-notification/toast-notification';

@Component({
  selector: 'app-tasks',
  imports: [FormsModule, TaskForm, TaskList, ToastNotification],
  templateUrl: './tasks.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(window:resize)': 'onResize()' },
})
export class Tasks {
  private readonly taskService = inject(TaskService);
  private readonly router = inject(Router);
  private readonly layout = inject(LayoutService);
  private readonly queryParams = toSignal(inject(ActivatedRoute).queryParamMap);

  protected readonly categories = CATEGORIES;
  protected readonly tasks = this.taskService.tasks;

  protected readonly editingId = signal<string | null>(null);
  // The category filter and search text live in the URL (?category=Work&q=report),
  // so the top bar can link straight to a filtered list.
  protected readonly categoryFilter = computed(() => {
    const category = this.queryParams()?.get('category') ?? 'All';
    return this.categories.includes(category) ? category : 'All';
  });
  protected readonly searchQuery = computed(() => this.queryParams()?.get('q')?.trim() ?? '');
  protected readonly notification = signal('');
  protected readonly windowWidth = signal(window.innerWidth);

  private notificationTimeout: ReturnType<typeof setTimeout> | undefined;
  private readonly alertedTaskIds = new Set<string>();

  // Derived data (the React version used .filter() / .reduce() inline)
  protected readonly filteredTasks = computed(() => {
    const filter = this.categoryFilter();
    const query = this.searchQuery().toLowerCase();

    return this.tasks().filter(
      (t) =>
        (filter === 'All' || t.category === filter) &&
        (!query ||
          t.title.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query)),
    );
  });

  protected readonly categoryStats = computed(() =>
    this.tasks().reduce<Record<string, number>>((stats, task) => {
      stats[task.category] = (stats[task.category] || 0) + 1;
      return stats;
    }, {}),
  );

  protected readonly doneCount = computed(() => this.tasks().filter((t) => t.done).length);

  protected readonly overdueCount = computed(
    () => this.tasks().filter((t) => getTaskStatus(t) === 'overdue').length,
  );

  protected readonly columns = computed(() => {
    // Width left for the page once the sidebar (if open) has taken its share.
    const width = this.windowWidth() - this.layout.sidebarOffset();
    return width >= 1250 ? 3 : width >= 576 ? 2 : 1;
  });

  constructor() {
    // Reminder: check every 30 seconds whether a task is due right now.
    const reminderInterval = setInterval(() => this.checkReminders(), 30000);

    inject(DestroyRef).onDestroy(() => {
      clearInterval(reminderInterval);
      clearTimeout(this.notificationTimeout);
    });
  }

  protected onCategoryChange(category: string): void {
    this.router.navigate([], {
      queryParams: { category: category === 'All' ? null : category },
      queryParamsHandling: 'merge',
    });
  }

  protected clearSearch(): void {
    this.router.navigate([], { queryParams: { q: null }, queryParamsHandling: 'merge' });
  }

  protected onResize(): void {
    this.windowWidth.set(window.innerWidth);
  }

  private checkReminders(): void {
    const now = new Date();
    const nowDate = now.toLocaleDateString('en-CA');
    const nowMinutes = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes(),
    ).padStart(2, '0')}`;

    this.tasks().forEach((task) => {
      const isDueNow =
        !task.done &&
        task.date === nowDate &&
        task.time === nowMinutes &&
        !this.alertedTaskIds.has(task.id);

      if (isDueNow) {
        this.alertedTaskIds.add(task.id);
        alert(`Reminder: "${task.title}" is due now!`);
      }
    });
  }

  private showNotification(message: string): void {
    this.notification.set(message);
    clearTimeout(this.notificationTimeout);
    this.notificationTimeout = setTimeout(() => this.notification.set(''), 3000);
  }

  protected handleTaskAdded(task: Task): void {
    this.taskService.add(task);
    this.showNotification(`"${task.title}" was added successfully!`);
  }

  protected handleDelete(id: string): void {
    const target = this.tasks().find((t) => String(t.id) === String(id));
    const confirmed = confirm(
      `Are you sure you want to delete "${target ? target.title : 'this task'}"?`,
    );
    if (!confirmed) return;

    this.taskService.remove(id);
    if (this.editingId() === id) this.editingId.set(null);
  }

  protected handleToggle(id: string): void {
    const target = this.tasks().find((t) => String(t.id) === String(id));
    if (!target) return;

    this.taskService.toggleDone(id);
    this.showNotification(
      target.done
        ? `"${target.title}" is back on your list.`
        : `"${target.title}" marked as done. Nice work!`,
    );
  }

  protected handleStartEdit(id: string): void {
    this.editingId.set(id);
  }

  protected handleCancelEdit(): void {
    this.editingId.set(null);
  }

  protected handleSaveEdit(event: { id: string; fields: TaskFields }): void {
    this.taskService.update(event.id, event.fields);
    this.editingId.set(null);
  }
}
