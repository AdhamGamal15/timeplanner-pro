import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  viewChild,
} from '@angular/core';
import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  type ChartData,
  type ChartOptions,
  type ChartType,
  DoughnutController,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js';

// Register only what the app uses, so the bundle stays small.
Chart.register(
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  DoughnutController,
  Legend,
  LinearScale,
  Tooltip,
);

/**
 * Small Angular wrapper around Chart.js (Ultima uses PrimeNG's <p-chart> for this).
 * Give it a type, data and options: it draws once, then updates when the inputs change.
 * The parent must give it a height.
 */
@Component({
  selector: 'app-chart',
  template: '<canvas #canvas role="img" [attr.aria-label]="label()"></canvas>',
  styles: ':host { display: block; position: relative; width: 100%; height: 100%; }',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartCanvas {
  readonly type = input.required<ChartType>();
  readonly data = input.required<ChartData>();
  readonly options = input<ChartOptions>({});
  /** Text alternative for screen readers. */
  readonly label = input('Chart');

  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private chart: Chart | undefined;

  constructor() {
    afterRenderEffect(() => {
      const type = this.type();
      const data = this.data();
      const options = this.options();

      if (this.chart) {
        this.chart.data = data;
        this.chart.options = options;
        this.chart.update();
      } else {
        this.chart = new Chart(this.canvas().nativeElement, { type, data, options });
      }
    });

    inject(DestroyRef).onDestroy(() => this.chart?.destroy());
  }
}
