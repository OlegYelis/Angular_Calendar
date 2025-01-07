import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AbsenceState } from './absence.reducer';
import { Absence } from './absence.model';
import moment from 'moment';

export const selectAbsenceState =
  createFeatureSelector<AbsenceState>('absence');

export const selectAllAbsences = createSelector(
  selectAbsenceState,
  (state) => state.absences
);

export const selectAbsencesInRange = (current: moment.Moment) =>
  createSelector(selectAllAbsences, (absences: Absence[]) => {
    return absences.filter((absence) => {
      const fromDate = moment(absence.fromDate);
      const toDate = moment(absence.toDate);

      return (
        (fromDate.year() === current.year() &&
          fromDate.month() === current.month()) ||
        (toDate.year() === current.year() && toDate.month() === current.month())
      );
    });
  });

export const selectCurrentDate = createSelector(
  selectAbsenceState,
  (state: AbsenceState) => state.currentDate
);

export const selectAbsenceDaysByYearAndType = (
  year: number,
  absenceType: string
) =>
  createSelector(selectAllAbsences, (absences: Absence[]) => {
    return absences
      .filter((absence) => {
        const fromDate = moment(absence.fromDate);
        const toDate = moment(absence.toDate);

        return (
          absence.absenceType === absenceType &&
          (fromDate.year() === year || toDate.year() === year)
        );
      })
      .reduce((totalDays, absence) => {
        const fromDate = moment(absence.fromDate);
        const toDate = moment(absence.toDate);

        const start = moment.max(fromDate, moment(`${year}-01-01`));
        const end = moment.min(toDate, moment(`${year}-12-31`));

        if (start.isAfter(end)) {
          return totalDays;
        }

        return totalDays + end.diff(start, 'days') + 1;
      }, 0);
  });

export const selectAbsenceById = (absenceId: string) =>
  createSelector(selectAllAbsences, (absences: Absence[]) => {
    return absences.find((absence) => absence.id === absenceId) || null;
  });

export const selectFilteredAbsences = (absenceType: string | undefined) =>
  createSelector(selectAllAbsences, (absences: Absence[]) => {
    if (absenceType) {
      return absences.filter((absence) => absence.absenceType === absenceType);
    }
    return absences;
  });
