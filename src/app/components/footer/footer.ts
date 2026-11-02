import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Footer ported from the PrimeNG "Ultima" template (app.footer.ts):
 * brand on the left, round social icon buttons on the right.
 */
@Component({
  selector: 'app-footer',
  templateUrl: './footer.html',
  styleUrls: ['./footer.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Footer {
  protected readonly year = new Date().getFullYear();
  protected readonly browserLanguage = navigator.language;

  protected readonly socials = [
    {
      label: 'GitHub',
      icon: 'pi-github',
      url: 'https://github.com/AdhamGamal15/timeplanner-pro',
    },
    { label: 'Facebook', icon: 'pi-facebook', url: 'https://www.facebook.com' },
    { label: 'Twitter', icon: 'pi-twitter', url: 'https://x.com' },
  ];
}
