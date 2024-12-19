import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';

@Pipe({
  name: 'dateFormatter',
})
export class DateFormatterPipe implements PipeTransform {
  transform(value: moment.Moment, format: string = 'MMMM YYYY'): string {
    return value.format(format);
  }
}
