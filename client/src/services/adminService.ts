import api from "../lib/api";

export interface AdminUser {
  _id: string;
  fullName: string;
  email: string;
  employeeId: string;
  department: {
    _id: string;
    name: string;
    code: string;
  } | null;
  isActive: boolean;
  createdAt: string;
  user: {
    isActive: boolean;
    lastLoginAt: string | null;
  } | null;
}

export interface FacultyUser {
  _id: string;
  fullName: string;
  email: string;
  employeeId: string;
  department: {
    _id: string;
    name: string;
    code: string;
  };
  designation: string;
  experience: number;
  gender?: string;
  phoneNumber?: string;
  status: string;
  isActive: boolean;
  assignedSections: string[];
  assignedSubjects: Array<{
    _id: string;
    name: string;
    code: string;
  }>;
  assignedStudentIds: Array<{
    _id: string;
    fullName: string;
    rollNumber: string;
    section: string;
  }>;
  user: {
    isActive: boolean;
    lastLoginAt: string | null;
  } | null;
}

export interface DepartmentItem {
  _id: string;
  name: string;
  code: string;
}

export interface SubjectItem {
  _id: string;
  name: string;
  code: string;
  department: string;
}

export interface FacultyAssignmentPayload {
  facultyId: string;
  assignedSections: string[];
  assignedSubjects: string[];
}

export interface FacultyStudentsResponse {
  students: Array<{
    _id: string;
    fullName: string;
    rollNumber: string;
    email: string;
    phoneNumber?: string;
    section: string;
    year: number;
    semester: number;
    attendancePercentage: number;
    cgpa: number;
    status: string;
    department: {
      name: string;
      code: string;
    };
  }>;
  facultyProfile: {
    id: string;
    fullName: string;
    employeeId: string;
    assignedSections: string[];
    assignedSubjectsCount: number;
    studentCount: number;
  };
}

// --- Super Admin - Admins ---
export async function fetchAdmins(): Promise<AdminUser[]> {
  const { data } = await api.get<{ success: boolean; data: AdminUser[] }>(
    "/api/super-admin/admins",
  );
  return data.data;
}

export async function createAdmin(payload: {
  fullName: string;
  email: string;
  employeeId: string;
  department?: string;
}): Promise<AdminUser> {
  const { data } = await api.post<{ success: boolean; data: AdminUser }>(
    "/api/super-admin/admins",
    payload,
  );
  return data.data;
}

export async function updateAdmin(
  id: string,
  payload: { department?: string | null; isActive?: boolean },
): Promise<AdminUser> {
  const { data } = await api.put<{ success: boolean; data: AdminUser }>(
    `/api/super-admin/admins/${id}`,
    payload,
  );
  return data.data;
}

export async function deleteAdmin(id: string): Promise<void> {
  await api.delete(`/api/super-admin/admins/${id}`);
}

// --- Admin - Faculty ---
export async function fetchFaculty(): Promise<FacultyUser[]> {
  const { data } = await api.get<{ success: boolean; data: FacultyUser[] }>("/api/admin/faculty");
  return data.data;
}

export async function createFaculty(payload: {
  fullName: string;
  email: string;
  employeeId: string;
  department: string;
  designation: string;
  experience?: number;
  gender?: string;
  phoneNumber?: string;
  password?: string;
}): Promise<FacultyUser> {
  const { data } = await api.post<{ success: boolean; data: FacultyUser }>(
    "/api/admin/faculty",
    payload,
  );
  return data.data;
}

export async function updateFaculty(
  id: string,
  payload: {
    department?: string;
    designation?: string;
    experience?: number;
    status?: string;
    isActive?: boolean;
  },
): Promise<FacultyUser> {
  const { data } = await api.put<{ success: boolean; data: FacultyUser }>(
    `/api/admin/faculty/${id}`,
    payload,
  );
  return data.data;
}

export async function deleteFaculty(id: string): Promise<void> {
  await api.delete(`/api/admin/faculty/${id}`);
}

// --- Admin - Assignments ---
export async function assignSectionsSubjects(
  payload: FacultyAssignmentPayload,
): Promise<FacultyUser> {
  const { data } = await api.post<{ success: boolean; data: FacultyUser }>(
    "/api/admin/assignments",
    payload,
  );
  return data.data;
}

// --- Faculty - Students ---
export async function fetchFacultyStudents(): Promise<FacultyStudentsResponse> {
  const { data } = await api.get<{ success: boolean; data: FacultyStudentsResponse }>(
    "/api/faculty/students",
  );
  return data.data;
}

// --- Academic Helpers ---
export async function fetchDepartments(): Promise<DepartmentItem[]> {
  const { data } = await api.get<{ success: boolean; data: DepartmentItem[] }>(
    "/api/academic/departments",
  );
  return data.data;
}

export async function fetchSubjects(departmentId?: string): Promise<SubjectItem[]> {
  const url = departmentId
    ? `/api/academic/subjects?department=${departmentId}`
    : "/api/academic/subjects";
  const { data } = await api.get<{ success: boolean; data: SubjectItem[] }>(url);
  return data.data;
}

// --- Admin - Students ---
export interface StudentItem {
  _id: string;
  fullName: string;
  rollNumber: string;
  admissionNumber?: string;
  email: string;
  phoneNumber?: string;
  gender?: string;
  dateOfBirth?: string;
  department: string | { _id: string; name: string; code: string };
  year: number;
  semester: number;
  section: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  attendancePercentage?: number;
  cgpa?: number;
  isActive: boolean;
  status?: string;
  createdAt?: string;
}

export async function fetchStudents(params?: {
  search?: string;
  department?: string;
  year?: string;
  semester?: string;
  section?: string;
  page?: number;
  limit?: number;
}): Promise<{ students: StudentItem[]; pagination: any }> {
  const { data } = await api.get<{
    success: boolean;
    data: { students: StudentItem[]; pagination: any };
  }>("/api/students", { params });
  return data.data;
}

export async function createStudent(payload: {
  fullName: string;
  rollNumber: string;
  admissionNumber?: string;
  email: string;
  phoneNumber?: string;
  gender?: string;
  department: string;
  year: number;
  semester: number;
  section: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  password?: string;
  cgpa?: number;
  attendancePercentage?: number;
}): Promise<StudentItem> {
  const { data } = await api.post<{ success: boolean; data: StudentItem }>(
    "/api/students",
    payload,
  );
  return data.data;
}

export async function updateStudent(
  id: string,
  payload: Partial<StudentItem>,
): Promise<StudentItem> {
  const { data } = await api.put<{ success: boolean; data: StudentItem }>(
    `/api/students/${id}`,
    payload,
  );
  return data.data;
}

export async function deleteStudent(id: string): Promise<void> {
  await api.delete(`/api/students/${id}`);
}

export interface TimetableSlot {
  _id: string;
  id?: string;
  day: string;
  start_time: string;
  time?: string;
  end_time?: string;
  subject: string;
  faculty_name: string;
  faculty?: string;
  room: string;
  department: string;
  year: number;
  semester: number;
  section: string;
}

export async function fetchTimetableSlots(params?: {
  department?: string;
  year?: number;
  semester?: number;
  section?: string;
}): Promise<TimetableSlot[]> {
  const { data } = await api.get<{ success: boolean; data: TimetableSlot[] }>(
    "/api/admin/timetable",
    { params },
  );
  return data.data;
}

export async function createTimetableSlot(payload: {
  day: string;
  time: string;
  subject: string;
  facultyName: string;
  room: string;
  department: string;
  year: number;
  semester: number;
  section: string;
}): Promise<TimetableSlot> {
  const { data } = await api.post<{ success: boolean; data: TimetableSlot }>(
    "/api/admin/timetable",
    payload,
  );
  return data.data;
}

export async function deleteTimetableSlot(id: string): Promise<void> {
  await api.delete(`/api/admin/timetable/${id}`);
}
