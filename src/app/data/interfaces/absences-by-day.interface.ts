import moment from 'moment';

export interface AbsenceByDay {
  date: moment.Moment;
  absenceType: string;
  comment: string;
}
