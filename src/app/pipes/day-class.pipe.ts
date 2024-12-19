import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';

@Pipe({
  name: 'dayClass',
})
export class DayClassPipe implements PipeTransform {
  transform(
    day: moment.Moment,
    currentDate: moment.Moment,
    today: moment.Moment
  ): string {
    const classes = [];

    if (!day.isSame(currentDate, 'month')) {
      classes.push('calendar__other-month');
    }
    if (day.isSame(today, 'day')) {
      classes.push('calendar__today');
    }
    if (day.isoWeekday() === 6 || day.isoWeekday() === 7) {
      classes.push('calendar__weekend');
    }

    return classes.join(' ');
  }
}
