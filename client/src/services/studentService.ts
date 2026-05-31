import { supabase } from "@/lib/supabaseClient";
import { seedDepartmentsIfEmpty } from "@/services/seedService";

export type StudentStatus = "Active" | "Warning" | "Inactive";

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
}

const mapStudentStatus = (isActive: boolean, attendancePercentage: number | null): StudentStatus => {
  if (!isActive) return "Inactive";
  return (attendancePercentage ?? 0) >= 75 ? "Active" : "Warning";
};

const sanitizeSearch = (value: string) => value.trim().replace(/'/g, "''").replace(/,/g, " ");

const mapStudent = (student: any): StudentRecord => {
  const attendance =
    student.attendance_percentage !== null && student.attendance_percentage !== undefined
      ? Number(student.attendance_percentage)
      : null;

  return {
    id: student.id,
    fullName: student.full_name,
    rollNumber: student.roll_number,
    admissionNumber: student.admission_number ?? null,
    email: student.email,
    phoneNumber: student.phone_number ?? null,
    gender: student.gender ?? null,
    dateOfBirth: student.date_of_birth ?? null,
    department: student.department,
    year: Number(student.year ?? 1),
    semester: Number(student.semester ?? 1),
    section: student.section,
    parentName: student.parent_name,
    parentPhone: student.parent_phone,
    parentEmail: student.parent_email ?? null,
    cgpa: student.cgpa !== null && student.cgpa !== undefined ? Number(student.cgpa) : null,
    attendancePercentage: attendance,
    profileImage: student.profile_image ?? null,
    isActive: Boolean(student.is_active),
    createdAt: student.created_at,
    updatedAt: student.updated_at,
    status: mapStudentStatus(Boolean(student.is_active), attendance),
  };
};

const applyFilters = (query: any, filters: StudentFilters) => {
  const searchValue = filters.search?.trim();

  if (searchValue) {
    const safeSearch = sanitizeSearch(searchValue);
    query = query.or(
      [
        `full_name.ilike.%${safeSearch}%`,
        `roll_number.ilike.%${safeSearch}%`,
        `admission_number.ilike.%${safeSearch}%`,
        `department.ilike.%${safeSearch}%`,
        `id.ilike.%${safeSearch}%`,
      ].join(","),
    );
  }

  if (filters.department && filters.department !== "All") {
    query = query.eq("department", filters.department);
  }

  if (filters.year && filters.year !== "All") {
    query = query.eq("year", Number(filters.year));
  }

  if (filters.status && filters.status !== "All") {
    if (filters.status === "Inactive") {
      query = query.eq("is_active", false);
    } else if (filters.status === "Active") {
      query = query.eq("is_active", true).gte("attendance_percentage", 75);
    } else if (filters.status === "Warning") {
      query = query.eq("is_active", true).lt("attendance_percentage", 75);
    }
  }

  if (filters.attendance && filters.attendance !== "All") {
    if (filters.attendance === "90%+") {
      query = query.gte("attendance_percentage", 90);
    } else if (filters.attendance === "75-89%") {
      query = query.gte("attendance_percentage", 75).lt("attendance_percentage", 90);
    } else if (filters.attendance === "Below 75%") {
      query = query.lt("attendance_percentage", 75);
    }
  }

  if (filters.cgpa && filters.cgpa !== "All") {
    if (filters.cgpa === "9.0+") {
      query = query.gte("cgpa", 9);
    } else if (filters.cgpa === "8.0-8.9") {
      query = query.gte("cgpa", 8).lt("cgpa", 9);
    } else if (filters.cgpa === "Below 8.0") {
      query = query.lt("cgpa", 8);
    }
  }

  return query;
};

export function getStudentDisplayStatus(student: Pick<StudentRecord, "status" | "attendancePercentage">) {
  return student.status || mapStudentStatus(true, student.attendancePercentage ?? null);
}

export async function fetchDepartments(): Promise<DepartmentOption[]> {
  try {
    const { data, error } = await supabase
      .from("departments")
      .select("code, name")
      .order("name", { ascending: true });

    if (error) {
      console.warn("Database departments table error, using fallback defaults:", error.message);
      return [
        { code: "CSE", name: "Computer Science & Engineering" },
        { code: "ECE", name: "Electronics & Communication Engineering" },
        { code: "EEE", name: "Electrical & Electronics Engineering" },
        { code: "MECH", name: "Mechanical Engineering" },
        { code: "CIVIL", name: "Civil Engineering" },
        { code: "IT", name: "Information Technology" },
        { code: "AIDS", name: "Artificial Intelligence & Data Science" },
        { code: "CSBS", name: "Computer Science & Business Systems" },
        { code: "MBA", name: "Master of Business Administration" },
        { code: "MCA", name: "Master of Computer Applications" },
      ];
    }

    // If departments table is empty, seed defaults and re-fetch
    if (!data || data.length === 0) {
      await seedDepartmentsIfEmpty();
      const { data: seeded, error: seededErr } = await supabase
        .from("departments")
        .select("code, name")
        .order("name", { ascending: true });
      if (seededErr) throw seededErr;
      return (seeded ?? []).map((department: any) => ({
        code: department.code,
        name: department.name,
      }));
    }

    return (data ?? []).map((department: any) => ({
      code: department.code,
      name: department.name,
    }));
  } catch (err) {
    console.error("Exception in fetchDepartments, using static fallbacks:", err);
    return [
      { code: "CSE", name: "Computer Science & Engineering" },
      { code: "ECE", name: "Electronics & Communication Engineering" },
      { code: "EEE", name: "Electrical & Electronics Engineering" },
      { code: "MECH", name: "Mechanical Engineering" },
      { code: "CIVIL", name: "Civil Engineering" },
      { code: "IT", name: "Information Technology" },
      { code: "AIDS", name: "Artificial Intelligence & Data Science" },
      { code: "CSBS", name: "Computer Science & Business Systems" },
      { code: "MBA", name: "Master of Business Administration" },
      { code: "MCA", name: "Master of Computer Applications" },
    ];
  }
}

export async function fetchStudents(filters: StudentFilters = {}): Promise<StudentListResponse> {
  const page = Math.max(1, Number(filters.page ?? 1));
  const limit = Math.max(1, Number(filters.limit ?? 8));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("students")
    .select(
      "id, full_name, roll_number, admission_number, email, phone_number, gender, date_of_birth, department, year, semester, section, parent_name, parent_phone, parent_email, cgpa, attendance_percentage, profile_image, is_active, created_at, updated_at",
      { count: "exact" },
    )
    .order("created_at", { ascending: false });

  query = applyFilters(query, filters);
  query = query.range(from, to);

  const { data, count, error } = await query;

  if (error) throw error;

  const students = (data ?? []).map(mapStudent);
  const totalStudents = count ?? 0;

  return {
    students,
    pagination: {
      totalStudents,
      totalPages: Math.max(1, Math.ceil(totalStudents / limit)),
      currentPage: page,
      limit,
    },
  };
}

export async function fetchStudentById(studentId: string): Promise<StudentRecord | null> {
  const { data, error } = await supabase
    .from("students")
    .select(
      "id, full_name, roll_number, admission_number, email, phone_number, gender, date_of_birth, department, year, semester, section, parent_name, parent_phone, parent_email, cgpa, attendance_percentage, profile_image, is_active, created_at, updated_at",
    )
    .eq("id", studentId)
    .maybeSingle();

  if (error) throw error;

  return data ? mapStudent(data) : null;
}

export async function createStudent(payload: StudentPayload): Promise<StudentRecord> {
  const normalizedRoll = payload.rollNumber.trim().toUpperCase();
  const normalizedEmail = payload.email.trim().toLowerCase();

  const STUDENT_SELECT =
    "id, full_name, roll_number, admission_number, email, phone_number, gender, date_of_birth, department, year, semester, section, parent_name, parent_phone, parent_email, cgpa, attendance_percentage, profile_image, is_active, created_at, updated_at";

  // Check if student already exists by roll_number OR email
  const { data: existing } = await supabase
    .from("students")
    .select("id")
    .or(`roll_number.eq.${normalizedRoll},email.eq.${normalizedEmail}`)
    .maybeSingle();

  if (existing?.id) {
    // Student already exists — update their details instead of inserting a duplicate
    console.info("studentService.createStudent: student already exists, updating…", existing.id);
    return updateStudent(existing.id, payload);
  }

  const insertPayload = {
    full_name: payload.fullName.trim(),
    roll_number: normalizedRoll,
    admission_number: payload.admissionNumber?.trim() || null,
    email: normalizedEmail,
    phone_number: payload.phoneNumber?.trim() || null,
    gender: payload.gender || null,
    date_of_birth: payload.dateOfBirth || null,
    department: payload.department,
    year: payload.year,
    semester: payload.semester,
    section: payload.section.trim().toUpperCase(),
    parent_name: payload.parentName.trim(),
    parent_phone: payload.parentPhone.trim(),
    parent_email: payload.parentEmail.trim().toLowerCase(),
    cgpa: payload.cgpa ?? null,
    attendance_percentage: payload.attendancePercentage ?? 100,
    profile_image: payload.profileImage ?? null,
    is_active: true,
  };

  const { data, error } = await supabase
    .from("students")
    .insert(insertPayload)
    .select(STUDENT_SELECT)
    .single();

  if (error) throw error;

  console.debug("studentService.createStudent inserted:", data);

  return mapStudent(data);
}

export async function updateStudent(
  studentId: string,
  payload: Partial<StudentPayload & { isActive: boolean }>,
): Promise<StudentRecord> {
  const updatePayload: Record<string, any> = {};

  if (payload.fullName !== undefined) updatePayload.full_name = payload.fullName.trim();
  if (payload.rollNumber !== undefined) updatePayload.roll_number = payload.rollNumber.trim().toUpperCase();
  if (payload.admissionNumber !== undefined) updatePayload.admission_number = payload.admissionNumber?.trim() || null;
  if (payload.email !== undefined) updatePayload.email = payload.email.trim().toLowerCase();
  if (payload.phoneNumber !== undefined) updatePayload.phone_number = payload.phoneNumber?.trim() || null;
  if (payload.gender !== undefined) updatePayload.gender = payload.gender || null;
  if (payload.dateOfBirth !== undefined) updatePayload.date_of_birth = payload.dateOfBirth || null;
  if (payload.department !== undefined) updatePayload.department = payload.department;
  if (payload.year !== undefined) updatePayload.year = payload.year;
  if (payload.semester !== undefined) updatePayload.semester = payload.semester;
  if (payload.section !== undefined) updatePayload.section = payload.section.trim().toUpperCase();
  if (payload.parentName !== undefined) updatePayload.parent_name = payload.parentName.trim();
  if (payload.parentPhone !== undefined) updatePayload.parent_phone = payload.parentPhone.trim();
  if (payload.parentEmail !== undefined) updatePayload.parent_email = payload.parentEmail.trim().toLowerCase();
  if (payload.cgpa !== undefined) updatePayload.cgpa = payload.cgpa ?? null;
  if (payload.attendancePercentage !== undefined) updatePayload.attendance_percentage = payload.attendancePercentage ?? null;
  if (payload.profileImage !== undefined) updatePayload.profile_image = payload.profileImage ?? null;
  if (payload.isActive !== undefined) updatePayload.is_active = payload.isActive;

  const { data, error } = await supabase
    .from("students")
    .update(updatePayload)
    .eq("id", studentId)
    .select(
      "id, full_name, roll_number, admission_number, email, phone_number, gender, date_of_birth, department, year, semester, section, parent_name, parent_phone, parent_email, cgpa, attendance_percentage, profile_image, is_active, created_at, updated_at",
    )
    .single();

  if (error) throw error;

  console.debug("studentService.updateStudent updated:", data);

  return mapStudent(data);
}

export async function deleteStudent(studentId: string): Promise<void> {
  const { error } = await supabase.from("students").delete().eq("id", studentId);

  if (error) throw error;
}