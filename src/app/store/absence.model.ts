export enum AbsenceType {
  Sick = 'sick',
  Vacation = 'vacation',
}

export interface Absence {
  id: string;
  absenceType: AbsenceType;
  fromDate: string;
  toDate: string;
  comment?: string;
}
