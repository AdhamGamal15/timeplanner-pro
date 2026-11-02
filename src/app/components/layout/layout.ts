import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterOutlet,
} from '@angular/router';
import { LayoutService } from '../../services/layout.service';
import { Navbar } from '../navbar/navbar';
import { Footer } from '../footer/footer';

const LAZY_PAGES = ['/about', '/help', '/contact'];

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, Navbar, Footer],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Layout {
  private readonly router = inject(Router);
  protected readonly layout = inject(LayoutService);

  /** True while a lazy-loaded page (About, Help, Contact) is being fetched. */
  protected readonly loadingLazyPage = signal(false);

  constructor() {
    this.router.events.pipe(takeUntilDestroyed(inject(DestroyRef))).subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.loadingLazyPage.set(LAZY_PAGES.some((page) => event.url.startsWith(page)));
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.loadingLazyPage.set(false);
      }
    });
  }
}
