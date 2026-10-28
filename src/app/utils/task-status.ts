import { Task } from '../models/task';

export type TaskStatus = 'overdue' | 'due-today' | 'upcoming';

export function getTaskStatus(task: Task): TaskStatus {
  if (!task.date || !task.time) return 'upcoming';

  const now = new Date();
  const todayStr = now.toLocaleDateString('en-CA');
  const taskDateTime = new Date(`${task.date}T${task.time}`);

  if (taskDateTime.getTime() < now.getTime()) return 'overdue';
  if (task.date === todayStr) return 'due-today';
  return 'upcoming';
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  overdue: 'Overdue',
  'due-today': 'Due Today',
  upcoming: 'Upcoming',
};

export const STATUS_BACKGROUNDS: Record<TaskStatus, string> = {
  overdue: '#fdecea',
  'due-today': '#fff8e1',
  upcoming: '#ffffff',
};

export const STATUS_BADGE_CLASSES: Record<TaskStatus, string> = {
  overdue: 'bg-danger',
  'due-today': 'bg-warning text-dark',
  upcoming: 'bg-secondary',
};
