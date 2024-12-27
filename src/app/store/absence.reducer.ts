import { createReducer, on } from '@ngrx/store';
import { addAbsence, updateAbsence, deleteAbsence } from './absence.actions';
import { Absence } from './absence.model';

export interface AbsenceState {
  absences: Absence[];
}

export const initialState: AbsenceState = {
  absences: [],
};

export const absenceReducer = createReducer(
  initialState,
  on(addAbsence, (state, { absence }) => ({
    ...state,
    absences: [...state.absences, absence],
  })),
  on(updateAbsence, (state, { absence }) => ({
    ...state,
    absences: state.absences.map((existingAbsence) =>
      existingAbsence.id === absence.id ? absence : existingAbsence
    ),
  })),
  on(deleteAbsence, (state, { id }) => ({
    ...state,
    absences: state.absences.filter((absence) => absence.id !== id),
  }))
);
