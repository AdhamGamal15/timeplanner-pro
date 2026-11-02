import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { LayoutService } from '../../services/layout.service';
import { TaskService } from '../../services/task.service';
import { CATEGORIES } from '../../utils/constants';
import { getTaskStatus } from '../../utils/task-status';

/**
 * Left menu ported from the PrimeNG "Ultima" template (static mode, light menu):
 * section titles, links, one collapsible submenu and a profile block at the bottom.
 */
@Component({
  selector: 'app-sidebar',
  imports: [RouterLink],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'layout-sidebar',
    'aria-label': 'Main menu',
    '[class.collapsed]': '!layout.isMobile() && layout.collapsed()',
    '[class.mobile-open]': 'layout.isMobile() && layout.mobileOpen()',
    '[class.animated]': 'animated()',
  },
})
export class Sidebar {
  protected readonly layout = inject(LayoutService);
  private readonly router = inject(Router);
  private readonly taskService = inject(TaskService);

  private readonly url = signal(this.router.url);
  protected readonly path = computed(() => this.url().split(/[?#]/)[0]);
  protected readonly activeCategory = computed(() => {
    const query = this.url().split('#')[0].split('?')[1] ?? '';
    return new URLSearchParams(query).get('category');
  });

  /** Transitions start only after the first paint, so a saved "collapsed" state doesn't flash. */
  protected readonly animated = signal(false);

  protected readonly tasksOpen = signal(this.router.url.startsWith('/tasks'));

  protected readonly totalTasks = computed(() => this.taskService.tasks().length);
  protected readonly overdueTasks = computed(
    () => this.taskService.tasks().filter((t) => getTaskStatus(t) === 'overdue').length,
  );
  protected readonly categories = computed(() => {
    const tasks = this.taskService.tasks();
    return CATEGORIES.map((name) => ({
      name,
      count: tasks.filter((t) => t.category === name).length,
    }));
  });

  constructor() {
    afterNextRender(() => requestAnimationFrame(() => this.animated.set(true)));

    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((event) => {
        this.url.set(event.urlAfterRedirects);
        if (this.path() === '/tasks') this.tasksOpen.set(true);
        this.layout.closeMobile();
      });
  }

  protected toggleTasks(): void {
    this.tasksOpen.update((open) => !open);
  }
}
