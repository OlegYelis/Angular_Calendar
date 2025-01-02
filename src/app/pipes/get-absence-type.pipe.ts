import { Pipe, PipeTransform } from '@angular/core';
import { AbsenceByDay } from '../data/interfaces/absences-by-day.interface';
import moment from 'moment';

@Pipe({
  name: 'getAbsenceType',
})
export class GetAbsenceTypePipe implements PipeTransform {
  transform(day: moment.Moment, absencesByDay: AbsenceByDay[]): string {
    const absence = absencesByDay.find((absence) =>
      moment(absence.date).isSame(day, 'day')
    );
    return absence ? absence.absenceType : '';
  }
}
