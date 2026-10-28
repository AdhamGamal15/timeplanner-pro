import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  protected readonly features = [
    {
      title: 'Stay Organized',
      text: 'Keep every task in one place with clear titles, dates, and categories.',
    },
    {
      title: 'Never Miss a Deadline',
      text: "Get an instant reminder the moment a task's due time arrives.",
    },
    {
      title: 'Track Your Progress',
      text: 'Watch category statistics update automatically as you add and remove tasks.',
    },
  ];
}
