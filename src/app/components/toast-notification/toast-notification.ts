import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-toast-notification',
  template: `
    @if (message()) {
      <div
        class="alert alert-success shadow position-fixed top-0 end-0 m-3 fw-semibold"
        style="z-index: 1080; min-width: 260px"
        role="alert"
      >
        {{ message() }}
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastNotification {
  readonly message = input('');
}
