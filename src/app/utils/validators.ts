export const TITLE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 .,'!?-]{2,79}$/;

export function validateTitle(title: string): string {
  const trimmed = (title || '').trim();
  if (trimmed.length === 0) return 'Title is required.';
  if (!TITLE_PATTERN.test(trimmed)) {
    return 'Title must be 3-80 characters and start with a letter or number.';
  }
  return '';
}

export function validateDateTime(dateStr: string, timeStr: string): string {
  if (!dateStr) return 'Please choose a date.';
  if (!timeStr) return 'Please choose a time.';

  const now = new Date();
  const todayStr = now.toLocaleDateString('en-CA');
  if (dateStr < todayStr) {
    return "You can't select a date in the past.";
  }

  if (dateStr === todayStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const selected = new Date();
    selected.setHours(hours, minutes, 0, 0);
    if (selected < now) {
      return "You can't select a past time for today's date.";
    }
  }

  return '';
}
