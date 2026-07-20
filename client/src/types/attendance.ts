export interface AttendanceRecord {
  date: string;
  subject: string;
  status: 'Present' | 'Absent' | string;
  time?: string;
}
