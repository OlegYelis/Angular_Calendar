import { Component } from '@angular/core';
import { CalendarComponent } from './ui/calendar/calendar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [CalendarComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'Angular_Calendar';
}
