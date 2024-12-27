import { Component, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  ReactiveFormsModule,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import moment from 'moment';
import { selectAllAbsences } from '../../store/absence.selectors';
import { addAbsence } from '../../store/absence.actions';
import { LIMITS } from '../../store/limits';
import { Absence, AbsenceType } from '../../store/absence.model';

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-absence-form',
  templateUrl: './absence-form.component.html',
  styleUrls: ['./absence-form.component.scss'],
  providers: [provideMomentDateAdapter(MY_FORMATS)],
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatSelectModule,
    MatButtonModule,
    MatDialogModule,
  ],
})
export class AbsenceFormComponent {
  private readonly store = inject(Store);
  currentAbsence = AbsenceType;

  form = new FormGroup({
    absenceType: new FormControl(null, Validators.required),
    fromDate: new FormControl(null, Validators.required),
    toDate: new FormControl(null, Validators.required),
    comment: new FormControl(null),
  });

  absencesByYear: Record<number, { vacation: number; sick: number }> = {};

  private destroy$ = new Subject<void>();

  constructor() {
    this.store
      .select(selectAllAbsences)
      .pipe(takeUntil(this.destroy$))
      .subscribe((absences) => {
        this.groupAbsencesByYear(absences);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  groupAbsencesByYear(absences: Absence[]) {
    this.absencesByYear = {};

    absences.forEach((absence) => {
      const { fromDate, toDate, absenceType } = absence;
      this.updateAbsencesByYear(fromDate, toDate, absenceType);
    });
  }

  private updateAbsencesByYear(
    fromDate: string,
    toDate: string,
    absenceType: AbsenceType
  ) {
    const { from, to } = this.getFormattedDates(fromDate, toDate);

    for (let year = from.year(); year <= to.year(); year++) {
      const { effectiveFromDate, effectiveToDate } = this.getEffectiveDates(
        from,
        to,
        year
      );
      const daysInYear = effectiveToDate.diff(effectiveFromDate, 'days') + 1;

      if (!this.absencesByYear[year]) {
        this.absencesByYear[year] = { vacation: 0, sick: 0 };
      }

      this.absencesByYear[year][absenceType] += daysInYear;
    }
  }

  private getFormattedDates(fromDate: string, toDate: string) {
    return {
      from: moment(fromDate),
      to: moment(toDate),
    };
  }

  private getEffectiveDates(
    from: moment.Moment,
    to: moment.Moment,
    year: number
  ) {
    const startOfYear = moment(`${year}-01-01`);
    const endOfYear = moment(`${year}-12-31`);

    const effectiveFromDate = from.isBefore(startOfYear) ? startOfYear : from;
    const effectiveToDate = to.isAfter(endOfYear) ? endOfYear : to;

    return { effectiveFromDate, effectiveToDate };
  }

  onSubmit() {
    if (this.form.invalid) {
      alert('Please fill in all required fields.');
      return;
    }

    const { absenceType, fromDate, toDate } = this.form.value;

    if (!absenceType || !fromDate || !toDate) {
      alert('Please fill in all required fields.');
      return;
    }

    const { from, to } = this.getFormattedDates(fromDate, toDate);

    if (this.isAbsenceExceedingLimits(absenceType, from, to)) {
      return;
    }

    const absence = this.createAbsenceObject(absenceType, from, to);
    this.store.dispatch(addAbsence({ absence }));
    this.form.reset();
  }

  private isAbsenceExceedingLimits(
    absenceType: AbsenceType,
    from: moment.Moment,
    to: moment.Moment
  ): boolean {
    for (let year = from.year(); year <= to.year(); year++) {
      const { effectiveFromDate, effectiveToDate } = this.getEffectiveDates(
        from,
        to,
        year
      );

      const requestedDays = effectiveToDate.diff(effectiveFromDate, 'days') + 1;

      if (!this.absencesByYear[year]) {
        this.absencesByYear[year] = { vacation: 0, sick: 0 };
      }

      const usedDays = this.absencesByYear[year]?.[absenceType] || 0;

      if (
        (absenceType === this.currentAbsence.Vacation &&
          usedDays + requestedDays > LIMITS.vacation) ||
        (absenceType === this.currentAbsence.Sick &&
          usedDays + requestedDays > LIMITS.sick)
      ) {
        alert(`Exceeded limit for ${absenceType} days in the year ${year}.`);
        return true;
      }
    }
    return false;
  }

  private createAbsenceObject(
    absenceType: AbsenceType,
    from: moment.Moment,
    to: moment.Moment
  ) {
    return {
      id: moment().format('X'),
      absenceType,
      comment: this.form.value.comment || '',
      fromDate: from.format('YYYY-MM-DD'),
      toDate: to.format('YYYY-MM-DD'),
    };
  }
}
