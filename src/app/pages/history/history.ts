import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Task } from '../../models/task';
import { TaskService } from '../../services/task.service';
import { getTaskStatus } from '../../utils/task-status';
import { ToastNotification } from '../../components/toast-notification/toast-notification';

type HistoryFilter = 'all' | 'done' | 'missed';

interface HistoryItem {
  task: Task;
  /** True when the task's time passed without being marked as done. */
  missed: boolean;
  dueLabel: string;
  addedLabel: string;
}

/** Task ids are `Date.now()` timestamps, so they tell us when a task was added. */
function addedDate(task: Task): string {
  const timestamp = Number(task.id);
  if (!Number.isFinite(timestamp) || timestamp < 946684800000) return '-';
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Tasks History, modelled on the "Order History" page of the Ultima template:
 * one card per task with an info strip, a status pill and an action bar.
 * History = tasks that are finished (done) or whose time passed (missed).
 */
@Component({
  selector: 'app-history',
  imports: [FormsModule, RouterLink, ToastNotification],
  templateUrl: './history.html',
  styleUrl: './history.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class History {
  private readonly taskService = inject(TaskService);

  protected readonly filter = signal<HistoryFilter>('all');
  protected readonly query = signal('');
  protected readonly notification = signal('');
  private notificationTimeout: ReturnType<typeof setTimeout> | undefined;

  /** Every finished or missed task, newest first. */
  private readonly items = computed<HistoryItem[]>(() =>
    this.taskService
      .tasks()
      .filter((task) => task.done || getTaskStatus(task) === 'overdue')
      .sort((a, b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`))
      .map((task) => ({
        task,
        missed: !task.done,
        dueLabel: task.getFormattedDate(),
        addedLabel: addedDate(task),
      })),
  );

  protected readonly counts = computed(() => {
    const all = this.items();
    const missed = all.filter((i) => i.missed).length;
    return { all: all.length, done: all.length - missed, missed };
  });

  protected readonly filters = computed(() => [
    { value: 'all' as const, label: 'All', count: this.counts().all },
    { value: 'done' as const, label: 'Completed', count: this.counts().done },
    { value: 'missed' as const, label: 'Missed', count: this.counts().missed },
  ]);

  protected readonly visible = computed(() => {
    const filter = this.filter();
    const query = this.query().trim().toLowerCase();

    return this.items().filter(({ task, missed }) => {
      if (filter === 'done' && missed) return false;
      if (filter === 'missed' && !missed) return false;
      return (
        !query ||
        [task.title, task.description, task.category].some((text) =>
          text.toLowerCase().includes(query),
        )
      );
    });
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.notificationTimeout));
  }

  protected toggleDone(task: Task): void {
    this.taskService.toggleDone(task.id);
    this.showNotification(
      task.done ? `"${task.title}" is back on your list.` : `"${task.title}" marked as done.`,
    );
  }

  protected remove(task: Task): void {
    if (!confirm(`Are you sure you want to delete "${task.title}"?`)) return;
    this.taskService.remove(task.id);
  }

  /** Like "Buy again" in the Ultima page: copies the task to tomorrow, same time. */
  protected doAgain(task: Task): void {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    try {
      const copy = new Task(
        Date.now().toString(),
        '',
        task.description,
        tomorrow.toLocaleDateString('en-CA'),
        task.time,
        task.category,
      );
      copy.setTitle(task.title);
      this.taskService.add(copy);
      this.showNotification(`"${copy.title}" was added for tomorrow.`);
    } catch (error) {
      this.showNotification((error as Error).message);
    }
  }

  private showNotification(message: string): void {
    this.notification.set(message);
    clearTimeout(this.notificationTimeout);
    this.notificationTimeout = setTimeout(() => this.notification.set(''), 3000);
  }
}
