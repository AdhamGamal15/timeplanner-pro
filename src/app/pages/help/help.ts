import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface Faq {
  question: string;
  answer: string;
}

const FAQS: Faq[] = [
  {
    question: 'How do I add a task?',
    answer:
      'Open the Tasks page and fill in the form: a title (3-80 characters, starting with a letter or number), a short description, a date and time that are not in the past, and a category. Then press Add Task or hit Enter.',
  },
  {
    question: 'How do I edit or delete a task?',
    answer:
      'Use the Edit and Delete buttons on the task card. While editing, press Enter to save or Esc to cancel. Deleting always asks for confirmation first.',
  },
  {
    question: 'What do Overdue, Due Today and Upcoming mean?',
    answer:
      'Overdue means the due date and time have passed. Due Today means it is due later today. Upcoming means it is due on a future day. Cards are colour-coded, and the bell in the top bar counts your overdue and due-today tasks.',
  },
  {
    question: 'How do reminders work?',
    answer:
      "While the Tasks page is open, TimePlanner Pro checks every 30 seconds and shows an alert when a task's date and time match the current minute.",
  },
  {
    question: 'How do I find or filter tasks?',
    answer:
      'Use the search icon in the top bar to search titles and descriptions, the category filter on the Tasks page, or the category links in the sidebar and in the top bar grid.',
  },
  {
    question: 'Where is my data stored?',
    answer:
      'In your browser (local storage) on this device. Nothing is sent to a server, so clearing your browser data removes your tasks. Changes sync between tabs of the same browser, and the download icon under the top bar saves a JSON copy of your tasks.',
  },
];

@Component({
  selector: 'app-help',
  imports: [FormsModule, RouterLink],
  templateUrl: './help.html',
  styleUrl: './help.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Help {
  protected readonly query = signal('');
  protected readonly openQuestion = signal<string | null>(FAQS[0].question);

  protected readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return FAQS;
    return FAQS.filter(
      (f) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q),
    );
  });

  protected toggle(question: string): void {
    this.openQuestion.update((current) => (current === question ? null : question));
  }
}
