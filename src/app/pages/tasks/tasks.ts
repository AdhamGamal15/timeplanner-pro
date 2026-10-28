import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Task, TaskFields } from '../../models/task';
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

  protected readonly categories = CATEGORIES;
  protected readonly tasks = this.taskService.tasks;

  protected readonly editingId = signal<string | null>(null);
  protected readonly categoryFilter = signal('All');
  protected readonly notification = signal('');
  protected readonly windowWidth = signal(window.innerWidth);

  private notificationTimeout: ReturnType<typeof setTimeout> | undefined;
  private readonly alertedTaskIds = new Set<string>();

  // Derived data (the React version used .filter() / .reduce() inline)
  protected readonly filteredTasks = computed(() => {
    const filter = this.categoryFilter();
    return filter === 'All' ? this.tasks() : this.tasks().filter((t) => t.category === filter);
  });

  protected readonly categoryStats = computed(() =>
    this.tasks().reduce<Record<string, number>>((stats, task) => {
      stats[task.category] = (stats[task.category] || 0) + 1;
      return stats;
    }, {}),
  );

  protected readonly overdueCount = computed(
    () => this.tasks().filter((t) => getTaskStatus(t) === 'overdue').length,
  );

  protected readonly columns = computed(() => {
    const width = this.windowWidth();
    return width >= 992 ? 3 : width >= 576 ? 2 : 1;
  });

  constructor() {
    // Reminder: check every 30 seconds whether a task is due right now.
    const reminderInterval = setInterval(() => this.checkReminders(), 30000);

    inject(DestroyRef).onDestroy(() => {
      clearInterval(reminderInterval);
      clearTimeout(this.notificationTimeout);
    });
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
        task.date === nowDate && task.time === nowMinutes && !this.alertedTaskIds.has(task.id);

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
