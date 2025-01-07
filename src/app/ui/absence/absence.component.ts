import { LIMITS } from './../../store/limits';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AbsenceFormComponent } from '../absence-form/absence-form.component';
import { combineLatest, Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import {
  selectAbsenceDaysByYearAndType,
  selectCurrentDate,
} from '../../store/absence.selectors';
import { DateFormatterPipe } from '../../pipes/date-formatter.pipe';
import { AbsenceType } from '../../store/absence.model';
import { CommonModule } from '@angular/common';
import moment from 'moment';

@Component({
  selector: 'app-absence',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatExpansionModule,
    DateFormatterPipe,
  ],
  templateUrl: './absence.component.html',
  styleUrls: ['./absence.component.scss'],
})
export class AbsenceComponent {
  private readonly store = inject(Store);
  private destroy$ = new Subject<void>();
  readonly dialog = inject(MatDialog);

  public readonly currentDate$ = this.store.select(selectCurrentDate);

  LIMITS = LIMITS;
  currentAbsence = AbsenceType;
  current: moment.Moment = moment();
  takenVacationDays = 0;
  takenSickDays = 0;

  public readonly vacationDays$ = this.currentDate$.pipe(
    switchMap((currentDate) =>
      this.store.select(
        selectAbsenceDaysByYearAndType(
          currentDate.year(),
          this.currentAbsence.Vacation
        )
      )
    )
  );

  public readonly sickDays$ = this.currentDate$.pipe(
    switchMap((currentDate) =>
      this.store.select(
        selectAbsenceDaysByYearAndType(
          currentDate.year(),
          this.currentAbsence.Sick
        )
      )
    )
  );

  constructor() {}

  ngOnInit(): void {
    combineLatest([this.vacationDays$, this.sickDays$]).pipe(
      takeUntil(this.destroy$)
    );

    this.currentDate$
      .pipe(takeUntil(this.destroy$))
      .subscribe((currentDate) => {
        this.current = currentDate;
      });
    this.vacationDays$.pipe(takeUntil(this.destroy$)).subscribe((days) => {
      this.takenVacationDays = days;
    });
    this.sickDays$.pipe(takeUntil(this.destroy$)).subscribe((days) => {
      this.takenSickDays = days;
    });
  }

  openForm() {
    const dialogRef = this.dialog.open(AbsenceFormComponent);

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result) {
          console.log('Форма подана:', result);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
