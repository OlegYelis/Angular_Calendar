import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';

@Pipe({
  name: 'isWeekend',
})
export class IsWeekendPipe implements PipeTransform {
  transform(day: moment.Moment): boolean {
    const weekday = day.isoWeekday();
    return weekday === 6 || weekday === 7;
  }
}
