import api from '@/lib/api';

export type StudentStatus = 'Active' | 'Warning' | 'Inactive';

export interface DepartmentOption {
  code: string;
  name: string;
}

export interface StudentRecord {
  id: string;
  fullName: string;
  rollNumber: string;
  admissionNumber: string | null;
  email: string;
  phoneNumber: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  department: string;
  year: number;
  semester: number;
  section: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string | null;
  cgpa: number | null;
  attendancePercentage: number | null;
  profileImage: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  status: StudentStatus;
}

export interface StudentFilters {
  search?: string;
  department?: string;
  year?: string;
  status?: string;
  attendance?: string;
  cgpa?: string;
  page?: number;
  limit?: number;
}

export interface StudentListResponse {
  students: StudentRecord[];
  pagination: {
    totalStudents: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

export interface StudentPayload {
  fullName: string;
  rollNumber: string;
  admissionNumber?: string;
  email: string;
  phoneNumber?: string;
  gender?: string;
  dateOfBirth?: string;
  department: string;
  year: number;
  semester: number;
  section: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  cgpa?: number | null;
  attendancePercentage?: number | null;
  profileImage?: string | null;
  password?: string;
}

const mapStudentStatus = (
  isActive: boolean,
  attendancePercentage: number | null,
): StudentStatus => {
  if (!isActive) return 'Inactive';
  return (attendancePercentage ?? 0) >= 75 ? 'Active' : 'Warning';
};

const mapStudent = (student: any): StudentRecord => {
  const attendance =
    student.attendance_percentage !== null && student.attendance_percentage !== undefined
      ? Number(student.attendance_percentage)
      : student.attendancePercentage !== null && student.attendancePercentage !== undefined
        ? Number(student.attendancePercentage)
        : null;

  const cgpaVal = student.cgpa !== null && student.cgpa !== undefined ? Number(student.cgpa) : null;

  return {
    id: student.id || student._id,
    fullName: student.full_name || student.fullName || '',
    rollNumber: student.roll_number || student.rollNumber || '',
    admissionNumber: student.admission_number || student.admissionNumber || null,
    email: student.email || '',
    phoneNumber: student.phone_number || student.phoneNumber || null,
    gender: student.gender || null,
    dateOfBirth: student.date_of_birth || student.dateOfBirth || null,
    department:
      typeof student.department === 'object' && student.department !== null
        ? student.department.code
        : student.department || '',
    year: Number(student.year ?? 1),
    semester: Number(student.semester ?? 1),
    section: student.section || '',
    parentName: student.parent_name || student.parentName || '',
    parentPhone: student.parent_phone || student.parentPhone || '',
    parentEmail: student.parent_email || student.parentEmail || null,
    cgpa: cgpaVal,
    attendancePercentage: attendance,
    profileImage: student.profile_image || student.profileImage || null,
    isActive:
      student.is_active !== undefined
        ? Boolean(student.is_active)
        : student.isActive !== undefined
          ? Boolean(student.isActive)
          : true,
    createdAt: student.created_at || student.createdAt || new Date().toISOString(),
    updatedAt: student.updated_at || student.updatedAt || new Date().toISOString(),
    status: mapStudentStatus(
      student.is_active !== undefined
        ? Boolean(student.is_active)
        : student.isActive !== undefined
          ? Boolean(student.isActive)
          : true,
      attendance,
    ),
  };
};

export function getStudentDisplayStatus(
  student: Pick<StudentRecord, 'status' | 'attendancePercentage'>,
) {
  return student.status || mapStudentStatus(true, student.attendancePercentage ?? null);
}

export async function fetchDepartments(): Promise<DepartmentOption[]> {
  const { data } = await api.get<{ success: boolean; data: any[] }>('/api/academic/departments');
  return (data.data ?? []).map((dept) => ({
    code: dept.code,
    name: dept.name,
  }));
}

export async function fetchStudents(filters: StudentFilters = {}): Promise<StudentListResponse> {
  const params: Record<string, any> = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 8,
  };

  if (filters.search) params.search = filters.search;
  if (filters.department && filters.department !== 'All') params.department = filters.department;
  if (filters.year && filters.year !== 'All') params.year = filters.year;

  // Status/attendance/cgpa filtering can be applied client-side or sent to server
  const { data } = await api.get<{
    success: boolean;
    data: { students: any[]; pagination: any };
  }>('/api/students', { params });

  const rawStudents = data.data?.students || [];
  let formatted = rawStudents.map(mapStudent);

  // Apply client-side filters for specific UI filter modal toggles not in backend DB logic
  if (filters.status && filters.status !== 'All') {
    formatted = formatted.filter((s) => s.status === filters.status);
  }

  if (filters.attendance && filters.attendance !== 'All') {
    formatted = formatted.filter((s) => {
      const att = s.attendancePercentage ?? 0;
      if (filters.attendance === '90%+') return att >= 90;
      if (filters.attendance === '75-89%') return att >= 75 && att < 90;
      if (filters.attendance === 'Below 75%') return att < 75;
      return true;
    });
  }

  if (filters.cgpa && filters.cgpa !== 'All') {
    formatted = formatted.filter((s) => {
      const cg = s.cgpa ?? 0;
      if (filters.cgpa === '9.0+') return cg >= 9;
      if (filters.cgpa === '8.0-8.9') return cg >= 8 && cg < 9;
      if (filters.cgpa === 'Below 8.0') return cg < 8;
      return true;
    });
  }

  const pagination = data.data?.pagination || {
    totalStudents: formatted.length,
    totalPages: Math.max(1, Math.ceil(formatted.length / (filters.limit ?? 8))),
    currentPage: filters.page ?? 1,
    limit: filters.limit ?? 8,
  };

  return {
    students: formatted,
    pagination: {
      totalStudents: pagination.totalStudents || formatted.length,
      totalPages: pagination.totalPages || 1,
      currentPage: pagination.currentPage || 1,
      limit: pagination.limit || 8,
    },
  };
}

export async function fetchStudentById(studentId: string): Promise<StudentRecord | null> {
  const { data } = await api.get<{ success: boolean; data: any }>(`/api/students/${studentId}`);
  return data.data ? mapStudent(data.data) : null;
}

export async function createStudent(payload: StudentPayload): Promise<StudentRecord> {
  // If password is not provided, set a secure default for mock accounts
  const finalPayload = {
    ...payload,
    password: payload.password || 'password123',
  };

  const { data } = await api.post<{ success: boolean; data: any }>('/api/students', finalPayload);
  return mapStudent(data.data);
}

export async function updateStudent(
  studentId: string,
  payload: Partial<StudentPayload & { isActive: boolean }>,
): Promise<StudentRecord> {
  const { data } = await api.put<{ success: boolean; data: any }>(
    `/api/students/${studentId}`,
    payload,
  );
  return mapStudent(data.data);
}

export async function deleteStudent(studentId: string): Promise<void> {
  await api.delete(`/api/students/${studentId}`);
}

export async function verifyStudent(
  rollNumber: string,
  fullName?: string,
  department?: string,
): Promise<StudentRecord> {
  const { data } = await api.post<{ success: boolean; data: any; message: string }>(
    '/api/students/verify',
    {
      rollNumber,
      fullName,
      department,
    },
  );
  return mapStudent(data.data);
}
