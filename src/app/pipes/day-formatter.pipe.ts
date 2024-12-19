import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';

@Pipe({
  name: 'dayFormatter',
})
export class DayFormatterPipe implements PipeTransform {
  transform(value: moment.Moment): number {
    return value.date();
  }
}
