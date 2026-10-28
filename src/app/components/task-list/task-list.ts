import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Task, TaskFields } from '../../models/task';
import { TaskCard } from '../task-card/task-card';

@Component({
  selector: 'app-task-list',
  imports: [TaskCard],
  templateUrl: './task-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskList {
  readonly tasks = input.required<Task[]>();
  readonly editingId = input<string | null>(null);
  readonly columns = input(1);

  readonly startEdit = output<string>();
  readonly cancelEdit = output<void>();
  readonly saveEdit = output<{ id: string; fields: TaskFields }>();
  readonly deleteTask = output<string>();

  /** Event delegation: one click listener on the container handles every Edit/Delete button. */
  protected onContainerClick(event: MouseEvent): void {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-action]');
    if (!button) return;

    const { action, id } = button.dataset;
    if (!id) return;

    if (action === 'delete') {
      this.deleteTask.emit(id);
    } else if (action === 'edit') {
      this.startEdit.emit(id);
    }
  }
}
