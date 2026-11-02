import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { TaskService } from '../../services/task.service';

/** Bar under the top bar: breadcrumb trail on the left, quick actions on the right (Ultima style). */
@Component({
  selector: 'app-breadcrumb',
  imports: [RouterLink],
  templateUrl: './breadcrumb.html',
  styleUrl: './breadcrumb.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'layout-breadcrumb' },
})
export class Breadcrumb {
  private readonly router = inject(Router);
  private readonly taskService = inject(TaskService);

  protected readonly crumbs = signal<string[]>(this.buildCrumbs());

  constructor() {
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.crumbs.set(this.buildCrumbs()));
  }

  /** Reads `data.breadcrumb` of the deepest active route (see app.routes.ts). */
  private buildCrumbs(): string[] {
    let route = this.router.routerState.snapshot.root;
    while (route.firstChild) route = route.firstChild;

    const crumbs: string[] = [...((route.data['breadcrumb'] as string[] | undefined) ?? [])];
    const category = route.queryParamMap.get('category');
    if (route.routeConfig?.path === 'tasks' && category) crumbs.push(category);
    return crumbs;
  }

  /** Downloads every task as a JSON file. */
  protected exportTasks(): void {
    const json = JSON.stringify(this.taskService.tasks(), null, 2);
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));

    const link = document.createElement('a');
    link.href = url;
    link.download = 'timeplanner-tasks.json';
    link.click();

    URL.revokeObjectURL(url);
  }
}
