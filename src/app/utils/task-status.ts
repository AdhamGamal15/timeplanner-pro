import { Task } from '../models/task';

export type TaskStatus = 'done' | 'overdue' | 'due-today' | 'upcoming';

export function getTaskStatus(task: Task): TaskStatus {
  if (task.done) return 'done';
  if (!task.date || !task.time) return 'upcoming';

  const now = new Date();
  const todayStr = now.toLocaleDateString('en-CA');
  const taskDateTime = new Date(`${task.date}T${task.time}`);

  if (taskDateTime.getTime() < now.getTime()) return 'overdue';
  if (task.date === todayStr) return 'due-today';
  return 'upcoming';
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  done: 'Done',
  overdue: 'Overdue',
  'due-today': 'Due Today',
  upcoming: 'Upcoming',
};

export const STATUS_BACKGROUNDS: Record<TaskStatus, string> = {
  done: '#e8f5e9',
  overdue: '#fdecea',
  'due-today': '#fff8e1',
  upcoming: '#ffffff',
};

export const STATUS_BADGE_CLASSES: Record<TaskStatus, string> = {
  done: 'bg-success',
  overdue: 'bg-danger',
  'due-today': 'bg-warning text-dark',
  upcoming: 'bg-secondary',
};
