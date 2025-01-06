import moment from 'moment';

export interface AbsenceByDay {
  id: string;
  date: moment.Moment;
  absenceType: string;
  comment: string;
}
