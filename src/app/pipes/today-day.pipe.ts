import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';

@Pipe({
  name: 'isToday',
})
export class IsTodayPipe implements PipeTransform {
  transform(day: moment.Moment, today: moment.Moment): boolean {
    return day.isSame(today, 'day');
  }
}
