import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AbsenceState } from './absence.reducer';

export const selectAbsenceState =
  createFeatureSelector<AbsenceState>('absence');

export const selectAllAbsences = createSelector(
  selectAbsenceState,
  (state) => state.absences
);
