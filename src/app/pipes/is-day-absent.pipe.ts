import { Pipe, PipeTransform } from '@angular/core';
import { AbsenceByDay } from '../data/interfaces/absences-by-day.interface';
import moment from 'moment';

@Pipe({
  name: 'isDayAbsent',
})
export class IsDayAbsentPipe implements PipeTransform {
  transform(day: moment.Moment, absencesByDay: AbsenceByDay[]): boolean {
    return absencesByDay.some((absence) =>
      moment(absence.date).isSame(day, 'day')
    );
  }
}
