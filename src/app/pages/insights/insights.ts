import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import type { ChartData, ChartOptions } from 'chart.js';
import { TaskService } from '../../services/task.service';
import { CATEGORIES } from '../../utils/constants';
import {
  MONTHS,
  monthlyCounts,
  peakDay,
  taskYears,
  WEEKDAYS,
  weekdayStats,
} from '../../utils/insights';
import { getTaskStatus } from '../../utils/task-status';
import { ChartCanvas } from '../../components/chart/chart';

const CATEGORY_COLORS: Record<string, string> = {
  Work: '#3f51b5',
  Personal: '#2196f3',
  Study: '#4caf50',
  Health: '#ff9800',
};

const WEEKDAY_COLORS = [
  '#3f51b5',
  '#2196f3',
  '#00bcd4',
  '#4caf50',
  '#26a69a',
  '#ff9800',
  '#ffeb3b',
];

/**
 * Insights page, modelled on the Ultima analytics dashboard:
 * summary cards, a "Monthly Comparison" bar chart (stacked or grouped)
 * and a semi/full doughnut with the best and worst day of the week.
 */
@Component({
  selector: 'app-insights',
  imports: [FormsModule, RouterLink, ChartCanvas],
  templateUrl: './insights.html',
  styleUrl: './insights.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Insights {
  private readonly tasks = inject(TaskService).tasks;
  private readonly currentYear = new Date().getFullYear();

  protected readonly weekdays = WEEKDAYS;
  protected readonly year = signal(this.currentYear);
  protected readonly stacked = signal(true);
  protected readonly fullCircle = signal(false);

  protected readonly years = computed(() => taskYears(this.tasks(), this.currentYear));

  protected readonly summary = computed(() => {
    const all = this.tasks();
    return {
      total: all.length,
      done: all.filter((t) => t.done).length,
      missed: all.filter((t) => getTaskStatus(t) === 'overdue').length,
      dueToday: all.filter((t) => getTaskStatus(t) === 'due-today').length,
    };
  });

  // ---- Monthly Comparison (bar chart) ----
  protected readonly yearTaskCount = computed(() =>
    Object.values(monthlyCounts(this.tasks(), this.year(), CATEGORIES))
      .flat()
      .reduce((sum, n) => sum + n, 0),
  );

  protected readonly monthlyData = computed<ChartData>(() => {
    const counts = monthlyCounts(this.tasks(), this.year(), CATEGORIES);
    return {
      labels: MONTHS.map((month) => month.slice(0, 3)),
      datasets: CATEGORIES.map((category) => ({
        label: category,
        data: counts[category],
        backgroundColor: CATEGORY_COLORS[category],
        borderRadius: 4,
      })),
    };
  });

  protected readonly monthlyOptions = computed<ChartOptions>(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
    scales: {
      x: { stacked: this.stacked(), grid: { display: false } },
      y: { stacked: this.stacked(), beginAtZero: true, ticks: { precision: 0 } },
    },
  }));

  // ---- Weekly insights (doughnut) ----
  private readonly weekStats = computed(() => weekdayStats(this.tasks()));

  protected readonly weekTotal = computed(() => this.weekStats().total.reduce((a, b) => a + b, 0));

  protected readonly weekData = computed<ChartData>(() => ({
    labels: [...WEEKDAYS],
    datasets: [
      {
        data: this.weekStats().total,
        backgroundColor: WEEKDAY_COLORS,
        borderWidth: 2,
      },
    ],
  }));

  protected readonly weekOptions = computed<ChartOptions>(() => ({
    responsive: true,
    maintainAspectRatio: false,
    circumference: this.fullCircle() ? 360 : 180,
    rotation: this.fullCircle() ? 0 : -90,
    cutout: '55%',
    plugins: { legend: { position: 'bottom', labels: { boxWidth: 14 } } },
  }));

  protected readonly bestDay = computed(() => {
    const stats = this.weekStats();
    const index = peakDay(stats.done);
    return index === null ? null : { name: WEEKDAYS[index], count: stats.done[index] };
  });

  protected readonly worstDay = computed(() => {
    const stats = this.weekStats();
    const index = peakDay(stats.missed);
    return index === null ? null : { name: WEEKDAYS[index], count: stats.missed[index] };
  });
}
