import { Store } from '@ngrx/store';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { DateFormatterPipe } from '../../pipes/date-formatter.pipe';
import { DayFormatterPipe } from '../../pipes/day-formatter.pipe';
import { SameMonthPipe } from '../../pipes/day-of-same-month.pipe';
import { IsTodayPipe } from '../../pipes/today-day.pipe';
import { IsWeekendPipe } from '../../pipes/weekend-day.pipe';
import { AbsenceTypeClassPipe } from '../../pipes/absence-type-class.pipe';
import { selectAbsencesInRange } from '../../store/absence.selectors';
import moment from 'moment';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    DateFormatterPipe,
    DayFormatterPipe,
    SameMonthPipe,
    IsTodayPipe,
    IsWeekendPipe,
    AbsenceTypeClassPipe,
  ],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent {
  private readonly store = inject(Store);

  currentDate: moment.Moment;
  today: moment.Moment;
  daysInMonth: moment.Moment[] = [];
  weekDays: string[] = [...Array(7)].map((_, i) =>
    moment()
      .day(i + 1)
      .format('ddd')
  );

  absencesByDay: {
    date: moment.Moment;
    absenceType: string;
    comment: string;
  }[] = [];

  constructor() {
    moment.updateLocale('en', { week: { dow: 1 } });
    this.currentDate = moment();
    this.today = moment();
  }

  ngOnInit(): void {
    this.generateCalendar();
  }

  generateCalendar(): void {
    const totalDays = 42; // Set the number of days in the calendar, taking into account 6 weeks (7 days each).
    // This ensures a fixed size of the calendar so that its height does not change when the months change.

    const startDay = this.currentDate.clone().startOf('month').startOf('week');
    const day = startDay.clone().subtract(1, 'day');
    const dayArray = [...Array(totalDays)].map(() => day.add(1, 'day').clone());

    this.daysInMonth = dayArray;

    this.store
      .select(selectAbsencesInRange(this.currentDate))
      .subscribe((absences) => {
        this.absencesByDay = absences
          .map((absence) => {
            const fromDate = moment(absence.fromDate);
            const toDate = moment(absence.toDate);
            const datesInRange = this.getDatesInRange(fromDate, toDate);

            return datesInRange.map((date) => ({
              date,
              absenceType: absence.absenceType,
              comment: absence.comment || '',
            }));
          })
          .flat();
      });
  }

  getDatesInRange(from: moment.Moment, to: moment.Moment): moment.Moment[] {
    let dates = [];
    let currentDate = from.clone();

    while (!currentDate.isAfter(to)) {
      dates.push(currentDate.clone());
      currentDate.add(1, 'day');
    }

    return dates;
  }

  isDayAbsent(day: moment.Moment): boolean {
    return this.absencesByDay.some((absence) =>
      moment(absence.date).isSame(day, 'day')
    );
  }

  getCommentForDay(day: moment.Moment): string {
    const absence = this.absencesByDay.find((absence) =>
      moment(absence.date).isSame(day, 'day')
    );
    return absence ? absence.comment : '';
  }

  getAbsenceTypeForDay(day: moment.Moment): string {
    const absence = this.absencesByDay.find((absence) =>
      moment(absence.date).isSame(day, 'day')
    );
    return absence ? absence.absenceType : '';
  }

  changeMonthHandler(direction: number): void {
    this.currentDate = this.currentDate.clone().add(direction, 'month');
    this.generateCalendar();
  }

  todayMonthHandler(): void {
    this.currentDate = this.today.clone();
    this.generateCalendar();
  }
}
