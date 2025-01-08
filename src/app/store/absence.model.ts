import { AbsenceType } from '../data/enums/abscense-type.enum';

export interface Absence {
  id: string;
  absenceType: AbsenceType;
  fromDate: string;
  toDate: string;
  comment?: string;
}
