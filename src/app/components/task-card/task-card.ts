import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Task, TaskFields } from '../../models/task';
import { CATEGORIES } from '../../utils/constants';
import {
  getTaskStatus,
  STATUS_BACKGROUNDS,
  STATUS_BADGE_CLASSES,
  STATUS_LABELS,
} from '../../utils/task-status';
import { validateDateTime, validateTitle } from '../../utils/validators';

const MAX_LENGTH = 90;

function truncate(text: string): string {
  if (!text) return '';
  return text.length > MAX_LENGTH ? `${text.slice(0, MAX_LENGTH)}...` : text;
}

/**
 * OnPush is the Angular counterpart of React.memo: the card only re-renders
 * when one of its inputs changes (or a signal it reads changes).
 */
@Component({
  selector: 'app-task-card',
  imports: [FormsModule],
  templateUrl: './task-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskCard {
  readonly task = input.required<Task>();
  readonly isEditing = input(false);

  readonly cancelEdit = output<void>();
  readonly saveEdit = output<{ id: string; fields: TaskFields }>();

  protected readonly categories = CATEGORIES;
  protected readonly statusLabels = STATUS_LABELS;
  protected readonly statusBadgeClasses = STATUS_BADGE_CLASSES;
  protected readonly statusBackgrounds = STATUS_BACKGROUNDS;
  protected readonly truncate = truncate;

  // Local state for the fields currently being edited on this card.
  protected readonly editData = signal<TaskFields>({
    title: '',
    description: '',
    date: '',
    time: '',
    category: CATEGORIES[0],
  });
  protected readonly editErrors = signal({ title: '', dateTime: '' });

  protected readonly status = computed(() => getTaskStatus(this.task()));
  protected readonly formattedDate = computed(() => {
    const t = this.task();
    return new Task(t.id, t.title, t.description, t.date, t.time, t.category).getFormattedDate();
  });

  constructor() {
    // Each time the card enters edit mode, load the task's current values.
    effect(() => {
      if (this.isEditing()) {
        untracked(() => {
          const t = this.task();
          this.editData.set({
            title: t.title,
            description: t.description,
            date: t.date,
            time: t.time,
            category: t.category,
          });
          this.editErrors.set({ title: '', dateTime: '' });
        });
      }
    });
  }

  protected setField(field: keyof TaskFields, value: string): void {
    this.editData.update((prev) => ({ ...prev, [field]: value }));
  }

  protected handleSave(): void {
    const data = this.editData();
    const titleErr = validateTitle(data.title);
    const dateTimeErr = validateDateTime(data.date, data.time);

    if (titleErr || dateTimeErr) {
      this.editErrors.set({ title: titleErr, dateTime: dateTimeErr });
      return;
    }

    this.saveEdit.emit({ id: this.task().id, fields: data });
  }

  protected onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.cancelEdit.emit();
    } else if (event.key === 'Enter' && (event.target as HTMLElement).tagName !== 'TEXTAREA') {
      event.preventDefault();
      this.handleSave();
    }
  }
}
