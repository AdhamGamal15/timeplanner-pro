// Task model: same fields and methods as the React version's Task constructor.

export interface TaskFields {
  title: string;
  description: string;
  date: string;
  time: string;
  category: string;
}

const TITLE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 .,'!?-]{2,79}$/;

export class Task implements TaskFields {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public date: string,
    public time: string,
    public category: string,
  ) {}

  getFormattedDate(): string {
    if (!this.date) return 'No date set';

    const [year, month, day] = this.date.split('-').map(Number);
    const dateOnly = new Date(year, month - 1, day);
    const dateString = dateOnly.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    if (!this.time) return dateString;

    const [hours, minutes] = this.time.split(':').map(Number);
    const dateTime = new Date(year, month - 1, day, hours, minutes);
    const timeString = dateTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    return `${dateString}, ${timeString}`;
  }

  setTitle(newTitle: string): void {
    const trimmed = (newTitle || '').trim();

    if (!TITLE_PATTERN.test(trimmed)) {
      throw new Error(
        'Title must be 3-80 characters, start with a letter or number, and use only letters, numbers, spaces, and basic punctuation.',
      );
    }

    this.title = trimmed;
  }
}
