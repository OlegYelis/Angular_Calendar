import { Component } from '@angular/core';
import { CalendarComponent } from './ui/calendar/calendar.component';
import { AbsenceComponent } from './ui/absence/absence.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CalendarComponent, AbsenceComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'Angular_Calendar';
}
