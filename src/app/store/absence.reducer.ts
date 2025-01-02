import { createReducer, on } from '@ngrx/store';
import {
  addAbsence,
  updateAbsence,
  deleteAbsence,
  setCurrentDate,
} from './absence.actions';
import { Absence } from './absence.model';
import moment from 'moment';

moment.updateLocale('en', { week: { dow: 1 } });

export interface AbsenceState {
  absences: Absence[];
  currentDate: moment.Moment;
}

export const initialState: AbsenceState = {
  absences: [],
  currentDate: moment(),
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
  })),
  on(setCurrentDate, (state, { currentDate }) => ({
    ...state,
    currentDate,
  }))
);
