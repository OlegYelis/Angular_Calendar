import { Component, inject } from '@angular/core';
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
import { Absence } from '../../store/absence.model';

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

  form = new FormGroup({
    absenceType: new FormControl(null, Validators.required),
    fromDate: new FormControl(null, Validators.required),
    toDate: new FormControl(null, Validators.required),
    comment: new FormControl(null),
  });

  // Object for storing the number of used vacation and sick leave days by year
  absencesByYear: Record<number, { vacation: number; sick: number }> = {};

  constructor() {
    this.store.select(selectAllAbsences).subscribe((absences) => {
      this.groupAbsencesByYear(absences);
    });
  }

  // Groups absences by year
  groupAbsencesByYear(absences: Absence[]) {
    this.absencesByYear = {};

    absences.forEach((absence) => {
      const fromDate = moment(absence.fromDate);
      const toDate = moment(absence.toDate);

      // Rounding up each year in the period of absence
      for (let year = fromDate.year(); year <= toDate.year(); year++) {
        const startOfYear = moment(`${year}-01-01`);
        const endOfYear = moment(`${year}-12-31`);

        // Determining effective dates within the year
        const effectiveFromDate = fromDate.isBefore(startOfYear)
          ? startOfYear
          : fromDate;
        const effectiveToDate = toDate.isAfter(endOfYear) ? endOfYear : toDate;

        const daysInYear = effectiveToDate.diff(effectiveFromDate, 'days') + 1;

        // Initialize the year if it does not already exist
        if (!this.absencesByYear[year]) {
          this.absencesByYear[year] = { vacation: 0, sick: 0 };
        }

        // Adding days for the corresponding type
        if (
          absence.absenceType === 'vacation' ||
          absence.absenceType === 'sick'
        ) {
          this.absencesByYear[year][absence.absenceType] += daysInYear;
        }
      }
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const { absenceType, fromDate, toDate } = this.form.value;

      const from = moment(fromDate);
      const to = moment(toDate);

      if (!absenceType || !fromDate || !toDate) {
        alert('Please fill in all required fields.');
        return;
      }

      // Rounding up each year in the period of absence
      for (let year = from.year(); year <= to.year(); year++) {
        const startOfYear = moment(`${year}-01-01`);
        const endOfYear = moment(`${year}-12-31`);

        // Determining effective dates within the year
        const effectiveFromDate = from.isBefore(startOfYear)
          ? startOfYear
          : from;
        const effectiveToDate = to.isAfter(endOfYear) ? endOfYear : to;

        const requestedDays =
          effectiveToDate.diff(effectiveFromDate, 'days') + 1;

        // Initialize the year if it does not already exist
        if (!this.absencesByYear[year]) {
          this.absencesByYear[year] = { vacation: 0, sick: 0 };
        }

        const usedDays = this.absencesByYear[year][absenceType] || 0;

        if (
          absenceType === 'vacation' &&
          usedDays + requestedDays > LIMITS.vacation
        ) {
          alert(`Vacation days limit exceeded for the year ${year}.`);
          return;
        }

        if (absenceType === 'sick' && usedDays + requestedDays > LIMITS.sick) {
          alert(`Sick leave days limit exceeded for the year ${year}.`);
          return;
        }
      }

      const absence = {
        id: moment().format('X'),
        absenceType: absenceType || '',
        comment: this.form.value.comment || '',
        fromDate: from.format('YYYY-MM-DD'),
        toDate: to.format('YYYY-MM-DD'),
      };

      this.store.dispatch(addAbsence({ absence }));
      this.form.reset();
    }
  }
}
