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
  selectFilteredAbsences,
} from '../../store/absence.selectors';
import moment from 'moment';
import { setCurrentDate } from '../../store/absence.actions';
import { Subject, takeUntil } from 'rxjs';
import { AbsenceByDay } from '../../data/interfaces/absences-by-day.interface';
import { IsDayAbsentPipe } from '../../pipes/is-day-absent.pipe';
import { GetAbsenceTypePipe } from '../../pipes/get-absence-type.pipe';
import { GetAbsenceCommentPipe } from '../../pipes/get-absence-comment.pipe';
import { MatDialog } from '@angular/material/dialog';
import { AbsenceFormComponent } from '../absence-form/absence-form.component';
import {
  MatButtonToggleChange,
  MatButtonToggleModule,
} from '@angular/material/button-toggle';
import { YearMonth } from '../../data/interfaces/year-month.interface';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';
import { AbsenceType } from '../../data/enums/abscense-type.enum';
import { CalendarViewMode } from '../../data/enums/calendar-view-mode.enum';
import { Absence } from '../../store/absence.model';

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
    MatButtonToggleModule,
    MatSelectModule,
    ReactiveFormsModule,
  ],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent {
  private readonly store = inject(Store);
  private destroy$ = new Subject<void>();
  readonly dialog = inject(MatDialog);
  currentAbsence = AbsenceType;
  CalendarViewMode = CalendarViewMode;

  public readonly currentDate$ = this.store.select(selectCurrentDate);

  totalDays = 42; // Set the number of days in the calendar, taking into account 6 weeks (7 days each).
  // This ensures a fixed size of the calendar so that its height does not change when the months change.
  current: moment.Moment = moment();
  today: moment.Moment;
  daysInMonth: moment.Moment[] = [];
  yearMonths: YearMonth[] = [];
  weekDays: string[] = [...Array(7)].map((_, i) =>
    moment()
      .day(i + 1)
      .format('ddd')
  );
  viewMode: CalendarViewMode = CalendarViewMode.Month;

  absencesByDay: AbsenceByDay[] = [];
  selectedAbsenceType: AbsenceType | undefined = undefined;

  constructor() {
    this.today = moment();
  }

  ngOnInit(): void {
    this.currentDate$
      .pipe(takeUntil(this.destroy$))
      .subscribe((currentDate) => (this.current = currentDate));
    this.updateCalendar();
  }

  updateCalendar(): void {
    if (this.viewMode === CalendarViewMode.Month) {
      this.generateMonthView();
    } else if (this.viewMode === CalendarViewMode.Year) {
      this.generateYearView();
    }
  }

  generateMonthView(): void {
    const startDay = this.current.clone().startOf('month').startOf('week');
    const day = startDay.clone().subtract(1, 'day');
    this.daysInMonth = [...Array(this.totalDays)].map(() =>
      day.add(1, 'day').clone()
    );

    this.store
      .select(selectAbsencesInRange(this.current))
      .pipe(takeUntil(this.destroy$))
      .subscribe((absences) => {
        this.absencesByDay = this.mapAbsencesToDates(absences);
        this.filterAbsences(this.selectedAbsenceType);
      });
  }

  filterAbsences(value: string | undefined): void {
    this.store
      .select(selectFilteredAbsences(value))
      .pipe(takeUntil(this.destroy$))
      .subscribe((absences) => {
        this.absencesByDay = this.mapAbsencesToDates(absences);
      });
  }

  private mapAbsencesToDates(absences: Absence[]): Array<{
    id: string;
    date: moment.Moment;
    absenceType: string;
    comment: string;
  }> {
    return absences
      .map((absence) => {
        const fromDate = moment(absence.fromDate);
        const toDate = moment(absence.toDate);
        const datesInRange = this.getDatesInRange(fromDate, toDate);

        return datesInRange.map((date) => ({
          id: absence.id,
          date,
          absenceType: absence.absenceType,
          comment: absence.comment || '',
        }));
      })
      .flat();
  }

  generateYearView(): void {
    const startMonth = this.current.clone().startOf('year');
    this.yearMonths = [...Array(12)].map((_, i) => {
      const month = startMonth.clone().add(i, 'month');
      const startDay = month.clone().startOf('month').startOf('week');
      const day = startDay.clone().subtract(1, 'day');

      const days = [...Array(this.totalDays)].map(() =>
        day.add(1, 'day').clone()
      );

      return { month, days };
    });
  }

  changeViewMode(event: MatButtonToggleChange): void {
    this.viewMode = event.value;
    this.updateCalendar();
  }

  changeMonthHandler(direction: number): void {
    const increment = this.viewMode;
    this.store.dispatch(
      setCurrentDate({
        currentDate: this.current.clone().add(direction, increment),
      })
    );
    this.updateCalendar();
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

  todayMonthHandler(): void {
    this.store.dispatch(setCurrentDate({ currentDate: this.today.clone() }));
    this.updateCalendar();
  }

  onAbsenceClick(
    day: moment.Moment,
    absencesByDay: AbsenceByDay[],
    event: MouseEvent
  ): void {
    event.stopPropagation();

    const absence = absencesByDay.find((abs) => abs.date.isSame(day, 'day'));

    if (absence) {
      let dialogRef = this.dialog.open(AbsenceFormComponent, {
        data: { absenceId: absence.id },
      });

      dialogRef
        .afterClosed()
        .pipe(takeUntil(this.destroy$))
        .subscribe((result) => {
          if (result) {
            console.log('Форма подана:', result);
          }
        });
    }
  }

  onMonthClick(month: moment.Moment) {
    this.store.dispatch(setCurrentDate({ currentDate: month }));
    this.viewMode = CalendarViewMode.Month;
    this.updateCalendar();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
