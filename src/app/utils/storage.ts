import { Task } from '../models/task';

export const STORAGE_KEY = 'timeplanner-pro-tasks';
const FIELD_SEPARATOR = '|';
const TASK_SEPARATOR = ';';

export function saveTasks(tasks: Task[]): void {
  const serialized = tasks
    .map((task) =>
      [
        task.id,
        task.title,
        task.description,
        task.date,
        task.time,
        task.category,
        String(task.done),
      ].join(FIELD_SEPARATOR),
    )
    .join(TASK_SEPARATOR);

  localStorage.setItem(STORAGE_KEY, serialized);
}

export function loadTasks(): Task[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  return raw
    .split(TASK_SEPARATOR)
    .filter((entry) => entry.length > 0)
    .map((entry) => {
      // `done` is the 7th field; tasks saved before it existed only have 6, so they load as not done.
      const [id, title, description, date, time, category, done] = entry.split(FIELD_SEPARATOR);
      return new Task(id, title, description, date, time, category, done === 'true');
    });
}
