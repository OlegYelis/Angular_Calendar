import { Store } from '@ngrx/store';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { DateFormatterPipe } from '../../pipes/date-formatter.pipe';
import { DayFormatterPipe } from '../../pipes/day-formatter.pipe';
import { SameMonthPipe } from '../../pipes/day-of-same-month.pipe';
import { IsTodayPipe } from '../../pipes/today-day.pipe';
import { IsWeekendPipe } from '../../pipes/weekend-day.pipe';
import { AbsenceTypeClassPipe } from '../../pipes/absence-type-class.pipe';
import {
  selectAbsencesInRange,
  selectCurrentDate,
} from '../../store/absence.selectors';
import moment from 'moment';
import { setCurrentDate } from '../../store/absence.actions';
import { Subject, takeUntil } from 'rxjs';
import { AbsenceByDay } from '../../data/interfaces/absences-by-day.interface';
import { IsDayAbsentPipe } from '../../pipes/is-day-absent.pipe';
import { GetAbsenceTypePipe } from '../../pipes/get-absence-type.pipe';
import { GetAbsenceCommentPipe } from '../../pipes/get-absence-comment.pipe';

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
    IsDayAbsentPipe,
    GetAbsenceTypePipe,
    GetAbsenceCommentPipe,
  ],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent {
  private readonly store = inject(Store);
  private destroy$ = new Subject<void>();

  public readonly currentDate$ = this.store.select(selectCurrentDate);

  current: moment.Moment = moment();
  today: moment.Moment;
  daysInMonth: moment.Moment[] = [];
  weekDays: string[] = [...Array(7)].map((_, i) =>
    moment()
      .day(i + 1)
      .format('ddd')
  );

  absencesByDay: AbsenceByDay[] = [];

  constructor() {
    this.today = moment();
  }

  ngOnInit(): void {
    this.currentDate$
      .pipe(takeUntil(this.destroy$))
      .subscribe((currentDate) => (this.current = currentDate));
    this.generateCalendar();
  }

  generateCalendar(): void {
    const totalDays = 42; // Set the number of days in the calendar, taking into account 6 weeks (7 days each).
    // This ensures a fixed size of the calendar so that its height does not change when the months change.

    const startDay = this.current.clone().startOf('month').startOf('week');
    const day = startDay.clone().subtract(1, 'day');
    const dayArray = [...Array(totalDays)].map(() => day.add(1, 'day').clone());

    this.daysInMonth = dayArray;

    this.store
      .select(selectAbsencesInRange(this.current))
      .pipe(takeUntil(this.destroy$))
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

  changeMonthHandler(direction: number): void {
    this.store.dispatch(
      setCurrentDate({
        currentDate: this.current.clone().add(direction, 'month'),
      })
    );
    this.generateCalendar();
  }

  todayMonthHandler(): void {
    this.store.dispatch(setCurrentDate({ currentDate: this.today.clone() }));
    this.generateCalendar();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
