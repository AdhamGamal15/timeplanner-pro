import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Task } from '../../models/task';
import { CATEGORIES } from '../../utils/constants';
import { validateDateTime, validateTitle } from '../../utils/validators';

@Component({
  selector: 'app-task-form',
  imports: [FormsModule],
  templateUrl: './task-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskForm {
  /** Emits a fully validated task; the parent decides what to do with it. */
  readonly taskAdded = output<Task>();

  protected readonly categories = CATEGORIES;

  protected readonly title = signal('');
  protected readonly description = signal('');
  protected readonly date = signal('');
  protected readonly time = signal('');
  protected readonly category = signal(CATEGORIES[0]);
  protected readonly submitError = signal('');

  // Real-time validation
  protected readonly titleError = computed(() =>
    this.title() ? validateTitle(this.title()) : '',
  );
  protected readonly dateTimeError = computed(() =>
    this.date() && this.time() ? validateDateTime(this.date(), this.time()) : '',
  );

  private readonly titleInput = viewChild<ElementRef<HTMLInputElement>>('titleInput');

  constructor() {
    // Auto-focus the title field once the form is on screen.
    afterNextRender(() => this.titleInput()?.nativeElement.focus());
  }

  protected onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && (event.target as HTMLElement).tagName !== 'TEXTAREA') {
      event.preventDefault();
      this.handleAdd();
    }
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.handleAdd();
  }

  private handleAdd(): void {
    this.submitError.set('');
    try {
      const titleErr = validateTitle(this.title());
      const dateTimeErr = validateDateTime(this.date(), this.time());

      if (titleErr) throw new Error(titleErr);
      if (dateTimeErr) throw new Error(dateTimeErr);
      if (!this.description().trim()) {
        throw new Error('Please add a short description for this task.');
      }

      const newTask = new Task(
        Date.now().toString(),
        '',
        this.description().trim(),
        this.date(),
        this.time(),
        this.category(),
      );
      newTask.setTitle(this.title());

      this.taskAdded.emit(newTask);
      this.resetForm();
    } catch (error) {
      this.submitError.set((error as Error).message);
    } finally {
      // Nothing to clean up: the form resets itself on success.
    }
  }

  private resetForm(): void {
    this.title.set('');
    this.description.set('');
    this.date.set('');
    this.time.set('');
    this.category.set(CATEGORIES[0]);
    this.submitError.set('');
    this.titleInput()?.nativeElement.focus();
  }
}
