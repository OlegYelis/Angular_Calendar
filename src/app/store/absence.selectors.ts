import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AbsenceState } from './absence.reducer';

export const selectAbsenceState =
  createFeatureSelector<AbsenceState>('absence');

export const selectAllAbsences = createSelector(
  selectAbsenceState,
  (state) => state.absences
);

// export const selectUsedDaysForYear = (year: number, type: string) =>
//   createSelector(selectAllAbsences, (absences) => {
//     return absences
//       .filter((absence) => absence.absenceType === type)
//       .filter((absence) => {
//         const fromYear = new Date(absence.fromDate).getFullYear();
//         const toYear = new Date(absence.toDate).getFullYear();
//         return fromYear <= year && toYear >= year;
//       })
//       .reduce((total, absence) => {
//         const fromDate = new Date(absence.fromDate);
//         const toDate = new Date(absence.toDate);

//         const fromYear = fromDate.getFullYear();
//         const toYear = toDate.getFullYear();

//         const effectiveFromDate =
//           fromYear < year ? new Date(`${year}-01-01`) : fromDate;
//         const effectiveToDate =
//           toYear > year ? new Date(`${year}-12-31`) : toDate;

//         return (
//           total +
//           (effectiveToDate.getTime() - effectiveFromDate.getTime()) /
//             (1000 * 3600 * 24) +
//           1
//         );
//       }, 0);
//   });
