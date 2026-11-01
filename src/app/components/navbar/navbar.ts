import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { LayoutService } from '../../services/layout.service';
import { TaskService } from '../../services/task.service';
import { CATEGORIES } from '../../utils/constants';
import { getTaskStatus, STATUS_LABELS } from '../../utils/task-status';

type PanelName = 'notifications' | 'categories' | 'profile';

/** Icon + colour used for each category in the "Browse by category" grid. */
const CATEGORY_STYLES: Record<string, { icon: string; color: string }> = {
  Work: { icon: 'pi-briefcase', color: 'indigo' },
  Personal: { icon: 'pi-user', color: 'green' },
  Study: { icon: 'pi-book', color: 'orange' },
  Health: { icon: 'pi-heart', color: 'pink' },
};

const MAX_REMINDERS = 5;

/**
 * Top bar ported from the PrimeNG "Ultima" template (indigo theme):
 * logo block, nav links, search, notifications, category grid and profile menu.
 */
@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'layout-topbar',
    role: 'banner',
    '[class.layout-topbar-menu-active]': 'mobileMenuOpen()',
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'closeAll()',
  },
})
export class Navbar {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly router = inject(Router);
  private readonly taskService = inject(TaskService);
  protected readonly layout = inject(LayoutService);

  protected readonly statusLabels = STATUS_LABELS;

  // ---- UI state -------------------------------------------------------
  protected readonly mobileMenuOpen = signal(false);
  protected readonly searchOpen = signal(false);
  protected readonly openPanel = signal<PanelName | null>(null);

  private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  // ---- Data derived from the task list ---------------------------------
  /** Ticks every minute so overdue / due-today reminders stay fresh. */
  private readonly now = signal(Date.now());

  protected readonly reminders = computed(() => {
    this.now();
    return this.taskService
      .tasks()
      .map((task) => ({ task, status: getTaskStatus(task) }))
      .filter((r) => r.status !== 'upcoming')
      .sort((a, b) =>
        `${a.task.date}T${a.task.time}`.localeCompare(`${b.task.date}T${b.task.time}`),
      );
  });
  protected readonly visibleReminders = computed(() => this.reminders().slice(0, MAX_REMINDERS));
  protected readonly hiddenReminderCount = computed(() =>
    Math.max(0, this.reminders().length - MAX_REMINDERS),
  );

  protected readonly categories = computed(() => {
    const tasks = this.taskService.tasks();
    return CATEGORIES.map((name) => ({
      name,
      count: tasks.filter((t) => t.category === name).length,
      ...(CATEGORY_STYLES[name] ?? { icon: 'pi-tag', color: 'indigo' }),
    }));
  });
  protected readonly totalTasks = computed(() => this.taskService.tasks().length);

  constructor() {
    const destroyRef = inject(DestroyRef);

    const timer = setInterval(() => this.now.set(Date.now()), 60_000);
    destroyRef.onDestroy(() => clearInterval(timer));

    // Close every popup after any navigation.
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(destroyRef),
      )
      .subscribe(() => this.closeAll());

    // Focus the search box as soon as the search panel is rendered.
    effect(() => this.searchInput()?.nativeElement.focus());
  }

  // ---- Handlers --------------------------------------------------------
  protected toggleMobileMenu(): void {
    this.mobileMenuOpen.update((open) => !open);
    this.openPanel.set(null);
    this.searchOpen.set(false);
    this.layout.closeMobile();
  }

  protected toggleSidebar(): void {
    this.closeAll();
    this.layout.toggle();
  }

  protected togglePanel(name: PanelName): void {
    this.searchOpen.set(false);
    this.openPanel.update((current) => (current === name ? null : name));
  }

  protected openSearch(): void {
    this.openPanel.set(null);
    this.searchOpen.set(true);
  }

  protected closeSearch(): void {
    this.searchOpen.set(false);
  }

  protected submitSearch(value: string): void {
    const q = value.trim();
    this.router.navigate(['/tasks'], { queryParams: { q: q || null } });
    this.closeAll();
  }

  /** Closes search, dropdowns and the mobile menu. */
  protected closeAll(): void {
    this.searchOpen.set(false);
    this.openPanel.set(null);
    this.mobileMenuOpen.set(false);
  }

  protected onDocumentClick(event: MouseEvent): void {
    // Clicks inside the top bar are handled by its own buttons.
    if (this.host.nativeElement.contains(event.target as Node)) return;
    this.closeAll();
  }
}
