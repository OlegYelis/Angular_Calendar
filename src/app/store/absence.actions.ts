import { createAction, props } from '@ngrx/store';
import { Absence } from './absence.model';

export const addAbsence = createAction(
  '[Absence] Add Absence',
  props<{ absence: Absence }>()
);

export const updateAbsence = createAction(
  '[Absence] Update Absence',
  props<{ absence: Absence }>()
);

export const deleteAbsence = createAction(
  '[Absence] Delete Absence',
  props<{ id: string }>()
);

export const loadAbsences = createAction('[Absence] Load Absences');
