import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';

@Pipe({
  name: 'sameMonth',
})
export class SameMonthPipe implements PipeTransform {
  transform(day: moment.Moment, currentDate: moment.Moment): boolean {
    return !day.isSame(currentDate, 'month');
  }
}
