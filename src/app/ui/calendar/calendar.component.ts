import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DateFormatterPipe } from '../../pipes/date-formatter.pipe';
import { DayFormatterPipe } from '../../pipes/day-formatter.pipe';
import { DayClassPipe } from '../../pipes/day-class.pipe';
import moment from 'moment';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, DateFormatterPipe, DayFormatterPipe, DayClassPipe],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent {
  currentDate: moment.Moment;
  today: moment.Moment;
  daysInMonth: moment.Moment[] = [];
  weekDays: string[] = [...Array(7)].map((e, i) =>
    moment()
      .day(i + 1)
      .format('ddd')
  );

  constructor() {
    moment.updateLocale('en', { week: { dow: 1 } });
    this.currentDate = moment();
    this.today = moment();
  }

  ngOnInit(): void {
    this.generateCalendar();
  }

  generateCalendar(): void {
    const totalDays = 42;
    const startDay = this.currentDate.clone().startOf('month').startOf('week');
    const day = startDay.clone().subtract(1, 'day');
    const dayArray = [...Array(totalDays)].map(() => day.add(1, 'day').clone());

    this.daysInMonth = dayArray;
  }

  changeMonthHandler(direction: number): void {
    this.currentDate.add(direction, 'month');
    this.generateCalendar();
  }

  todayMonthHandler(): void {
    this.currentDate = this.today.clone();
    this.generateCalendar();
  }
}
