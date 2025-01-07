import { Component, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
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
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
} from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import moment from 'moment';
import {
  selectAbsenceById,
  selectAllAbsences,
} from '../../store/absence.selectors';
import {
  addAbsence,
  deleteAbsence,
  updateAbsence,
} from '../../store/absence.actions';
import { LIMITS } from '../../store/limits';
import { Absence, AbsenceType } from '../../store/absence.model';
import { ConfirmationFormComponent } from '../confirmation-form/confirmation-form.component';

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
  readonly dialogRef = inject(MatDialogRef<AbsenceFormComponent>);
  readonly data = inject(MAT_DIALOG_DATA);
  private _snackBar = inject(MatSnackBar);
  readonly dialog = inject(MatDialog);
  currentAbsence = AbsenceType;

  form = new FormGroup({
    absenceType: new FormControl<AbsenceType | null>(null, Validators.required),
    fromDate: new FormControl<moment.Moment | null>(null, Validators.required),
    toDate: new FormControl<moment.Moment | null>(null, Validators.required),
    comment: new FormControl<string | null>(null),
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

  ngOnInit() {
    if (this.data?.absenceId) {
      this.loadAbsenceData(this.data.absenceId);
    }
  }

  private loadAbsenceData(absenceId: string) {
    this.store
      .select(selectAbsenceById(absenceId))
      .pipe(take(1))
      .subscribe((absence) => {
        if (absence) {
          this.populateForm(absence);
        }
      });
  }

  private populateForm(absence: Absence) {
    this.form.setValue({
      absenceType: absence.absenceType || null,
      fromDate: moment(absence.fromDate) || null,
      toDate: moment(absence.toDate) || null,
      comment: absence.comment || null,
    });
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

  deleteAbscenceHandler() {
    const dialogRef = this.dialog.open(ConfirmationFormComponent, {
      data: {
        title: 'Confirmation of deletion',
        description: 'Are you sure you want to remove this absence?',
        buttonOk: 'Delete',
        buttonCancel: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'ok') {
        this.store.dispatch(deleteAbsence({ id: this.data.absenceId }));
        this.form.reset();
        this.dialogRef.close();
        this._snackBar.open('Absence deleted successfully!', 'Close');
      }
    });
  }

  createNewAbsenceHandler() {
    if (this.form.invalid) {
      this._snackBar.open('Please fill in all required fields.', 'Close');
      return;
    }

    const { absenceType, fromDate, toDate } = this.form.value;

    if (!absenceType || !fromDate || !toDate) {
      this._snackBar.open('Please fill in all required fields.', 'Close');
      return;
    }

    if (this.isAbsenceExceedingLimits(absenceType, fromDate, toDate)) {
      return;
    }

    if (this.isAbsenceOverlapping(fromDate, toDate)) {
      this._snackBar.open(
        'The selected dates overlap with an existing absence.',
        'Close'
      );
      return;
    }

    const absence = this.createAbsenceObject(absenceType, fromDate, toDate);
    this.store.dispatch(addAbsence({ absence }));
    this.form.reset();
    this.dialogRef.close();
    this._snackBar.open('Absence added successfully!', 'Close');
  }

  updateAbsenceHandler() {
    if (this.form.invalid) {
      this._snackBar.open('Please fill in all required fields.', 'Close');
      return;
    }

    const { absenceType, fromDate, toDate } = this.form.value;

    if (!absenceType || !fromDate || !toDate) {
      this._snackBar.open('Please fill in all required fields.', 'Close');
      return;
    }

    if (this.isAbsenceExceedingLimits(absenceType, fromDate, toDate)) {
      return;
    }

    if (this.isAbsenceOverlapping(fromDate, toDate)) {
      this._snackBar.open(
        'The selected dates overlap with an existing absence.',
        'Close'
      );
      return;
    }

    const absence = this.createAbsenceObject(absenceType, fromDate, toDate);
    absence.id = this.data.absenceId;
    console.log('absence: ', absence);
    this.store.dispatch(updateAbsence({ absence }));
    this.form.reset();
    this.dialogRef.close();
    this._snackBar.open('Absence updated successfully!', 'Close');
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

      let usedDays = this.absencesByYear[year]?.[absenceType] || 0;
      if (this.data?.absenceId) {
        const currentAbsence = this.getCurrentAbsenceById(this.data.absenceId);

        if (
          currentAbsence &&
          currentAbsence.absenceType === absenceType &&
          moment(currentAbsence.fromDate).year() <= year &&
          moment(currentAbsence.toDate).year() >= year
        ) {
          const {
            effectiveFromDate: currentFromDate,
            effectiveToDate: currentToDate,
          } = this.getEffectiveDates(
            moment(currentAbsence.fromDate),
            moment(currentAbsence.toDate),
            year
          );

          const currentDays = currentToDate.diff(currentFromDate, 'days') + 1;

          usedDays -= currentDays;
        }
      }

      if (
        (absenceType === this.currentAbsence.Vacation &&
          usedDays + requestedDays > LIMITS.vacation) ||
        (absenceType === this.currentAbsence.Sick &&
          usedDays + requestedDays > LIMITS.sick)
      ) {
        this._snackBar.open(
          `Exceeded limit for ${absenceType} days in the year ${year}.`,
          'Close'
        );
        return true;
      }
    }

    return false;
  }

  private getCurrentAbsenceById(absenceId: string): Absence | undefined {
    let absence: Absence | undefined;
    this.store
      .select(selectAbsenceById(absenceId))
      .pipe(take(1))
      .subscribe((result) => (absence = result ?? undefined));
    return absence;
  }

  private isAbsenceOverlapping(
    from: moment.Moment,
    to: moment.Moment
  ): boolean {
    let isOverlapping = false;

    this.store
      .select(selectAllAbsences)
      .pipe(takeUntil(this.destroy$))
      .subscribe((absences) => {
        isOverlapping = absences.some((absence) => {
          if (absence.id === this.data?.absenceId) {
            return false;
          }

          const existingFrom = moment(absence.fromDate);
          const existingTo = moment(absence.toDate);

          return (
            from.isBetween(existingFrom, existingTo, 'days', '[]') ||
            to.isBetween(existingFrom, existingTo, 'days', '[]') ||
            (existingFrom.isBetween(from, to, 'days', '[]') &&
              existingTo.isBetween(from, to, 'days', '[]'))
          );
        });
      });

    return isOverlapping;
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
