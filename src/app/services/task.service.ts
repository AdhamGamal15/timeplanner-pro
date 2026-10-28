import { effect, Injectable, signal } from '@angular/core';
import { Task, TaskFields } from '../models/task';
import { loadTasks, saveTasks, STORAGE_KEY } from '../utils/storage';

/**
 * Holds the task list as a signal, auto-saves it to localStorage on every change
 * and keeps it in sync across browser tabs through the `storage` event.
 */
@Injectable({ providedIn: 'root' })
export class TaskService {
  readonly tasks = signal<Task[]>(loadTasks());

  constructor() {
    // Auto-save whenever the list changes.
    effect(() => saveTasks(this.tasks()));

    // Cross-tab sync: another tab wrote to localStorage, so reload.
    window.addEventListener('storage', (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        this.tasks.set(loadTasks());
      }
    });
  }

  add(task: Task): void {
    this.tasks.update((prev) => [...prev, task]);
  }

  remove(id: string): void {
    this.tasks.update((prev) => prev.filter((t) => String(t.id) !== String(id)));
  }

  update(id: string, fields: TaskFields): void {
    this.tasks.update((prev) =>
      prev.map((t) => {
        if (String(t.id) !== String(id)) return t;
        const updated = new Task(t.id, t.title, t.description, t.date, t.time, t.category);
        Object.assign(updated, fields);
        return updated;
      }),
    );
  }
}
