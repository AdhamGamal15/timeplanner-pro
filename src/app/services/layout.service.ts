import { computed, effect, Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'timeplanner-pro-sidebar-collapsed';
const MOBILE_QUERY = '(max-width: 991px)';

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Shared layout state (a small version of Ultima's LayoutService):
 * - desktop: the sidebar can be collapsed (remembered in localStorage)
 * - mobile:  the sidebar is an overlay that opens on demand
 */
@Injectable({ providedIn: 'root' })
export class LayoutService {
  private readonly mediaQuery = window.matchMedia(MOBILE_QUERY);

  readonly isMobile = signal(this.mediaQuery.matches);
  readonly collapsed = signal(readCollapsed());
  readonly mobileOpen = signal(false);

  /** Whether the sidebar is currently visible, for the current screen size. */
  readonly sidebarVisible = computed(() =>
    this.isMobile() ? this.mobileOpen() : !this.collapsed(),
  );

  /** Width taken from the page by the sidebar (0 on mobile, where it overlays). */
  readonly sidebarOffset = computed(() => (this.isMobile() || this.collapsed() ? 0 : 288));

  constructor() {
    this.mediaQuery.addEventListener('change', (event) => {
      this.isMobile.set(event.matches);
      this.mobileOpen.set(false);
    });

    effect(() => {
      const value = String(this.collapsed());
      try {
        localStorage.setItem(STORAGE_KEY, value);
      } catch {
        /* storage unavailable: the choice just isn't remembered */
      }
    });
  }

  toggle(): void {
    if (this.isMobile()) {
      this.mobileOpen.update((open) => !open);
    } else {
      this.collapsed.update((collapsed) => !collapsed);
    }
  }

  closeMobile(): void {
    this.mobileOpen.set(false);
  }
}
