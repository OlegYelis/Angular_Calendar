import { createReducer, on } from '@ngrx/store';
import {
  addAbsence,
  updateAbsence,
  deleteAbsence,
  loadAbsencesSuccess,
} from './absence.actions';
import { Absence } from './absence.model';

export interface AbsenceState {
  absences: Absence[];
}

export const initialState: AbsenceState = {
  absences: [],
};

export const absenceReducer = createReducer(
  initialState,
  on(loadAbsencesSuccess, (state, { absences }) => ({ ...state, absences })),
  on(addAbsence, (state, { absence }) => ({
    ...state,
    absences: [...state.absences, absence],
  })),
  on(updateAbsence, (state, { absence }) => ({
    ...state,
    absences: state.absences.map((a) => (a.id === absence.id ? absence : a)),
  })),
  on(deleteAbsence, (state, { id }) => ({
    ...state,
    absences: state.absences.filter((a) => a.id !== id),
  }))
);
