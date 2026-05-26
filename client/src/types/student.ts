export interface Student {
  _id?: string;
  fullName: string;
  rollNumber: string;
  email: string;
  phoneNumber: string;
  gender: string;
  dateOfBirth?: Date | string;
  department: string;
  year: number;
  semester: number;
  section: string;
  parentName: string;
  parentPhone: string;
  cgpa?: number;
  attendancePercentage?: number;
  status?: string;
}
