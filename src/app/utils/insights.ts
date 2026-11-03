import { Task } from '../models/task';
import { getTaskStatus } from './task-status';

export const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

/** Splits a task's "YYYY-MM-DD" date without any timezone surprises. */
function parseDate(date: string): { year: number; month: number; day: number } | null {
  const [year, month, day] = date.split('-').map(Number);
  if (!year || !month || !day) return null;
  return { year, month: month - 1, day };
}

/** Years that have at least one task, newest first, always including `currentYear`. */
export function taskYears(tasks: Task[], currentYear: number): number[] {
  const years = new Set<number>([currentYear]);
  for (const task of tasks) {
    const parsed = parseDate(task.date);
    if (parsed) years.add(parsed.year);
  }
  return [...years].sort((a, b) => b - a);
}

/** For every category, how many tasks fall in each month (index 0 = January) of `year`. */
export function monthlyCounts(
  tasks: Task[],
  year: number,
  categories: readonly string[],
): Record<string, number[]> {
  const counts: Record<string, number[]> = {};
  for (const category of categories) counts[category] = new Array(12).fill(0);

  for (const task of tasks) {
    const parsed = parseDate(task.date);
    if (!parsed || parsed.year !== year || !counts[task.category]) continue;
    counts[task.category][parsed.month]++;
  }
  return counts;
}

export interface WeekdayStats {
  /** All tasks per weekday (index 0 = Sunday). */
  total: number[];
  /** Completed tasks per weekday. */
  done: number[];
  /** Tasks whose time passed without being completed, per weekday. */
  missed: number[];
}

export function weekdayStats(tasks: Task[]): WeekdayStats {
  const stats: WeekdayStats = {
    total: new Array(7).fill(0),
    done: new Array(7).fill(0),
    missed: new Array(7).fill(0),
  };

  for (const task of tasks) {
    const parsed = parseDate(task.date);
    if (!parsed) continue;

    const weekday = new Date(parsed.year, parsed.month, parsed.day).getDay();
    stats.total[weekday]++;
    if (task.done) stats.done[weekday]++;
    else if (getTaskStatus(task) === 'overdue') stats.missed[weekday]++;
  }
  return stats;
}

/** Index of the largest value, or null when every value is 0 (ties: the earliest day wins). */
export function peakDay(values: number[]): number | null {
  const max = Math.max(...values);
  return max > 0 ? values.indexOf(max) : null;
}
