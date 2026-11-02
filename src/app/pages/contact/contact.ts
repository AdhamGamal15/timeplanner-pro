import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CONTACT_EMAIL } from '../../utils/constants';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
  selector: 'app-contact',
  imports: [FormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Contact {
  protected readonly contactEmail = CONTACT_EMAIL;

  protected readonly name = signal('');
  protected readonly email = signal('');
  protected readonly subject = signal('');
  protected readonly message = signal('');
  protected readonly submitted = signal(false);
  protected readonly sent = signal(false);

  // Errors only show after the first submit attempt, then update live.
  protected readonly errors = computed(() => ({
    name: this.name().trim() ? '' : 'Please enter your name.',
    email: !this.email().trim()
      ? 'Please enter your email.'
      : EMAIL_PATTERN.test(this.email().trim())
        ? ''
        : 'Please enter a valid email address.',
    message:
      this.message().trim().length >= 10 ? '' : 'Your message should be at least 10 characters.',
  }));

  protected readonly hasErrors = computed(() => Object.values(this.errors()).some(Boolean));

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.submitted.set(true);
    this.sent.set(false);
    if (this.hasErrors()) return;

    // There is no server: open the visitor's email app with the message ready to send.
    const subject = this.subject().trim() || `Message from ${this.name().trim()}`;
    const body = `${this.message().trim()}\n\n${this.name().trim()} (${this.email().trim()})`;
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    this.sent.set(true);
    this.submitted.set(false);
    this.name.set('');
    this.email.set('');
    this.subject.set('');
    this.message.set('');
  }
}
