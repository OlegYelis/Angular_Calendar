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
