import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'absenceTypeClass',
})
export class AbsenceTypeClassPipe implements PipeTransform {
  transform(absenceType: string): string {
    switch (absenceType) {
      case 'vacation':
        return 'calendar__absence--vacation';
      case 'sick':
        return 'calendar__absence--sick';
      default:
        return '';
    }
  }
}
