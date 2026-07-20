import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
  AlertCircle,
  Edit,
  Filter,
  Loader2,
  Mail,
  Phone,
  Plus,
  Search,
  Trash2,
  UserRound,
  Users,
  CheckCircle,
} from 'lucide-react';
import { Badge, Card, PageHeader } from '@/components/dashboard/ui';
import { toast } from 'sonner';
import {
  StudentDeleteAlert,
  StudentFilterModal,
  StudentFormModal,
  StudentVerifyModal,
} from './students/StudentDialogs';
import {
  createStudent,
  deleteStudent,
  fetchDepartments,
  fetchStudents,
  getStudentDisplayStatus,
  updateStudent,
  verifyStudent,
  type DepartmentOption,
  type StudentPayload,
  type StudentRecord,
} from '@/services/studentService';

const PAGE_SIZE = 8;

const defaultFilters = {
  department: 'All',
  year: 'All',
  status: 'All',
  attendance: 'All',
  cgpa: 'All',
};

const buildPageWindow = (currentPage: number, totalPages: number) => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages]);
  for (let page = currentPage - 1; page <= currentPage + 1; page += 1) {
    if (page > 1 && page < totalPages) pages.add(page);
  }

  return Array.from(pages).sort((left, right) => left - right);
};

const getDepartmentName = (departmentCode: string, departments: DepartmentOption[]) =>
  departments.find((department) => department.code === departmentCode)?.name ?? departmentCode;

const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .map((value) => value[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

export function StudentsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(defaultFilters);
  const [page, setPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StudentRecord | null>(null);

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: fetchDepartments,
  });

  const { data: statsData, isLoading: isStatsLoading } = useQuery({
    queryKey: [
      'students-stats',
      search,
      filters.department,
      filters.year,
      filters.status,
      filters.attendance,
      filters.cgpa,
    ],
    queryFn: () =>
      fetchStudents({
        search: search || undefined,
        department: filters.department,
        year: filters.year,
        status: filters.status,
        attendance: filters.attendance,
        cgpa: filters.cgpa,
        page: 1,
        limit: 1000,
      }),
  });

  const {
    data: listData,
    isLoading,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: [
      'students',
      search,
      filters.department,
      filters.year,
      filters.status,
      filters.attendance,
      filters.cgpa,
      page,
    ],
    queryFn: () =>
      fetchStudents({
        search: search || undefined,
        department: filters.department,
        year: filters.year,
        status: filters.status,
        attendance: filters.attendance,
        cgpa: filters.cgpa,
        page,
        limit: PAGE_SIZE,
      }),
    placeholderData: (previous) => previous,
  });

  const students = listData?.students ?? [];
  const pagination = listData?.pagination ?? {
    totalStudents: 0,
    totalPages: 1,
    currentPage: 1,
    limit: PAGE_SIZE,
  };
  const statsStudents = statsData?.students ?? students;

  const createStudentMutation = useMutation({
    mutationFn: createStudent,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['students'] });
      await queryClient.invalidateQueries({ queryKey: ['students-stats'] });
      toast.success('Student added successfully');
      setIsFormOpen(false);
      setEditingStudent(null);
      console.debug('createStudentMutation: success, invalidated queries');
    },
    onError: (mutationError: unknown) => {
      const message =
        mutationError instanceof Error ? mutationError.message : JSON.stringify(mutationError);
      console.error('createStudent error:', mutationError);
      toast.error(message || 'Failed to add student');
    },
  });

  const updateStudentMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: StudentPayload }) =>
      updateStudent(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['students'] });
      await queryClient.invalidateQueries({ queryKey: ['students-stats'] });
      toast.success('Student updated successfully');
      setIsFormOpen(false);
      setEditingStudent(null);
    },
    onError: (mutationError: unknown) => {
      const message =
        mutationError instanceof Error ? mutationError.message : JSON.stringify(mutationError);
      console.error('updateStudent error:', mutationError);
      toast.error(message || 'Failed to update student');
    },
  });

  const deleteStudentMutation = useMutation({
    mutationFn: deleteStudent,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['students'] });
      await queryClient.invalidateQueries({ queryKey: ['students-stats'] });
      toast.success('Student deleted successfully');
      setDeleteTarget(null);
    },
    onError: (mutationError: unknown) => {
      const message =
        mutationError instanceof Error ? mutationError.message : JSON.stringify(mutationError);
      console.error('deleteStudent error:', mutationError);
      toast.error(message || 'Failed to delete student');
    },
  });

  const activeStudentsCount = useMemo(
    () => statsStudents.filter((student) => getStudentDisplayStatus(student) === 'Active').length,
    [statsStudents],
  );

  const warningStudentsCount = useMemo(
    () => statsStudents.filter((student) => getStudentDisplayStatus(student) === 'Warning').length,
    [statsStudents],
  );

  const inactiveStudentsCount = useMemo(
    () => statsStudents.filter((student) => getStudentDisplayStatus(student) === 'Inactive').length,
    [statsStudents],
  );

  const averageAttendance = useMemo(() => {
    if (!statsStudents.length) return '0%';
    const total = statsStudents.reduce(
      (sum, student) => sum + (student.attendancePercentage ?? 0),
      0,
    );
    return `${Math.round(total / statsStudents.length)}%`;
  }, [statsStudents]);

  const averageCgpa = useMemo(() => {
    if (!statsStudents.length) return '0.00';
    const total = statsStudents.reduce((sum, student) => sum + (student.cgpa ?? 0), 0);
    return (total / statsStudents.length).toFixed(2);
  }, [statsStudents]);

  const topCards = statsStudents.slice(0, 4);
  const pageButtons = buildPageWindow(pagination.currentPage, pagination.totalPages);

  const openCreateModal = () => {
    setEditingStudent(null);
    setIsFormOpen(true);
  };

  const openEditModal = (student: StudentRecord) => {
    setEditingStudent(student);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (payload: StudentPayload) => {
    // Prevent duplicate submissions
    if (createStudentMutation.isPending || updateStudentMutation.isPending) {
      console.debug('Submission blocked: mutation already in progress');
      return;
    }

    console.debug('handleFormSubmit payload:', payload);

    try {
      if (editingStudent) {
        const res = await updateStudentMutation.mutateAsync({ id: editingStudent.id, payload });
        console.debug('updateStudent result:', res);
        return;
      }

      const res = await createStudentMutation.mutateAsync(payload);
      console.debug('createStudent result:', res);
    } catch (err) {
      console.error('handleFormSubmit caught error:', err);
    }
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
    setPage(1);
    setIsFilterOpen(false);
  };

  const handleApplyFilters = (nextFilters: typeof defaultFilters) => {
    setFilters(nextFilters);
    setPage(1);
    setIsFilterOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        desc="Manage student profiles, attendance and academic records."
        actions={
          <>
            <button
              onClick={() => setIsFilterOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm bg-background/60"
            >
              <Filter className="size-4" /> Filter
            </button>
            <button
              onClick={() => setIsVerifyOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm hover:opacity-90 transition"
            >
              <CheckCircle className="size-4" /> Verify Student
            </button>
          </>
        }
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {topCards.map((student) => (
          <Card key={student.id} className="text-center">
            <div className="mx-auto size-16 rounded-2xl bg-gradient-primary grid place-items-center text-white text-xl font-bold">
              {initials(student.fullName)}
            </div>
            <div className="mt-3 font-semibold">{student.fullName}</div>
            <div className="text-xs text-muted-foreground">
              {getDepartmentName(student.department, departments)} · Year {student.year}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-muted/60 p-2">
                <div className="font-bold">{student.attendancePercentage ?? 0}%</div>
                <div className="text-muted-foreground">Attendance</div>
              </div>
              <div className="rounded-lg bg-muted/60 p-2">
                <div className="font-bold">{(student.cgpa ?? 0).toFixed(2)}</div>
                <div className="text-muted-foreground">CGPA</div>
              </div>
            </div>
            <div className="mt-3 flex justify-center gap-1.5">
              <a
                href={`mailto:${student.email}`}
                className="size-8 rounded-lg border grid place-items-center hover:bg-accent"
                aria-label={`Email ${student.fullName}`}
              >
                <Mail className="size-3.5" />
              </a>
              {student.phoneNumber ? (
                <a
                  href={`tel:${student.phoneNumber}`}
                  className="size-8 rounded-lg border grid place-items-center hover:bg-accent"
                  aria-label={`Call ${student.fullName}`}
                >
                  <Phone className="size-3.5" />
                </a>
              ) : (
                <button
                  disabled
                  className="size-8 rounded-lg border grid place-items-center opacity-40 cursor-not-allowed text-muted-foreground"
                  aria-label="No phone number"
                >
                  <Phone className="size-3.5" />
                </button>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-5 flex items-center justify-between border-b">
          <h3 className="font-semibold">All Students</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search…"
              className="rounded-xl border bg-background/60 pl-9 pr-3 py-1.5 text-sm"
            />
          </div>
        </div>

        {isLoading || isFetching || isStatsLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <Loader2 className="size-8 text-primary animate-spin" />
            <span className="text-sm text-muted-foreground">Loading students...</span>
          </div>
        ) : isError ? (
          <div className="py-12 px-6 text-center text-sm text-muted-foreground space-y-3">
            <AlertCircle className="size-8 mx-auto text-rose-500" />
            <p>{error instanceof Error ? error.message : 'Failed to load students.'}</p>
            <button
              onClick={() => queryClient.invalidateQueries({ queryKey: ['students'] })}
              className="px-4 py-2 rounded-xl border text-sm hover:bg-accent"
            >
              Retry
            </button>
          </div>
        ) : students.length === 0 ? (
          <div className="py-12 px-6 text-center text-sm text-muted-foreground space-y-2">
            <UserRound className="size-8 mx-auto text-muted-foreground" />
            <p>No students match the current search and filters.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                  <tr>
                    {['ID', 'Name', 'Branch', 'Year', 'Attendance', 'Status', ''].map((header) => (
                      <th key={header} className="text-left px-5 py-3 font-medium">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id} className="border-t hover:bg-muted/30">
                      <td className="px-5 py-3 font-mono text-xs">{student.rollNumber}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-lg bg-gradient-violet text-white grid place-items-center text-xs font-bold">
                            {initials(student.fullName)}
                          </div>
                          <span className="font-medium">{student.fullName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {getDepartmentName(student.department, departments)}
                      </td>
                      <td className="px-5 py-3">{student.year}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full bg-gradient-primary"
                              style={{ width: `${student.attendancePercentage ?? 0}%` }}
                            />
                          </div>
                          <span className="text-xs">{student.attendancePercentage ?? 0}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <Badge
                          tone={
                            getStudentDisplayStatus(student) === 'Active'
                              ? 'success'
                              : getStudentDisplayStatus(student) === 'Warning'
                                ? 'warn'
                                : 'danger'
                          }
                        >
                          {getStudentDisplayStatus(student)}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate({ to: `/dashboard/students/${student.id}` })}
                            className="text-indigo text-xs font-medium hover:underline"
                          >
                            View
                          </button>
                          <button
                            onClick={() => openEditModal(student)}
                            className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground cursor-pointer transition"
                            title="Edit Student"
                          >
                            <Edit className="size-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(student)}
                            className="p-1 rounded hover:bg-accent text-rose-500 hover:text-rose-600 cursor-pointer transition"
                            title="Delete Student"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 flex items-center justify-between text-xs text-muted-foreground border-t">
              <span>
                Showing {students.length ? (pagination.currentPage - 1) * pagination.limit + 1 : 0}–
                {(pagination.currentPage - 1) * pagination.limit + students.length} of{' '}
                {pagination.totalStudents}
              </span>
              <div className="flex gap-1 items-center">
                <button
                  onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                  disabled={pagination.currentPage === 1}
                  className="px-2.5 py-1 rounded-md border bg-background disabled:opacity-50"
                >
                  Prev
                </button>
                {pageButtons.map((pageNumber) => (
                  <button
                    key={pageNumber}
                    onClick={() => setPage(pageNumber)}
                    className={`px-2.5 py-1 rounded-md ${
                      pageNumber === pagination.currentPage
                        ? 'bg-gradient-primary text-white'
                        : 'border bg-background'
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setPage((currentPage) => Math.min(pagination.totalPages, currentPage + 1))
                  }
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-2.5 py-1 rounded-md border bg-background disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Users className="size-5 text-indigo" />
            <h3 className="font-semibold">Student Overview</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-soft border">
              <span className="text-sm text-muted-foreground">Total Students</span>
              <span className="font-bold">{pagination.totalStudents}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-soft border">
              <span className="text-sm text-muted-foreground">Active</span>
              <span className="font-bold">{activeStudentsCount}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-soft border">
              <span className="text-sm text-muted-foreground">Warning</span>
              <span className="font-bold">{warningStudentsCount}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-soft border">
              <span className="text-sm text-muted-foreground">Inactive</span>
              <span className="font-bold">{inactiveStudentsCount}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-soft border">
              <span className="text-sm text-muted-foreground">Average Attendance</span>
              <span className="font-bold">{averageAttendance}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-soft border">
              <span className="text-sm text-muted-foreground">Average CGPA</span>
              <span className="font-bold">{averageCgpa}</span>
            </div>
          </div>
        </Card>

        <Card className="flex flex-col justify-center items-center text-center p-6 space-y-4">
          <div className="p-3 rounded-full bg-primary/10 text-primary">
            <UserRound className="size-8" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gradient">Realtime Student Registry</h3>
            <p className="text-xs text-muted-foreground max-w-sm mt-1">
              Manage student records from Supabase with instant create, update, delete, search,
              filters, profile navigation, and pagination.
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 rounded-xl bg-gradient-primary text-white text-xs font-semibold glow-primary cursor-pointer hover:opacity-95 transition"
          >
            Launch Add Dialog
          </button>
        </Card>
      </div>

      <StudentFilterModal
        open={isFilterOpen}
        departments={departments}
        initialFilters={filters}
        onClose={() => setIsFilterOpen(false)}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

      <StudentFormModal
        open={isFormOpen}
        mode={editingStudent ? 'edit' : 'create'}
        student={editingStudent}
        departments={departments}
        submitting={createStudentMutation.isPending || updateStudentMutation.isPending}
        onClose={() => {
          setIsFormOpen(false);
          setEditingStudent(null);
        }}
        onSubmit={handleFormSubmit}
      />

      <StudentDeleteAlert
        open={Boolean(deleteTarget)}
        studentName={deleteTarget?.fullName ?? 'this student'}
        loading={deleteStudentMutation.isPending}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteStudentMutation.mutateAsync(deleteTarget.id);
        }}
      />

      <StudentVerifyModal
        open={isVerifyOpen}
        departments={departments}
        onClose={() => setIsVerifyOpen(false)}
        onVerify={verifyStudent}
      />
    </div>
  );
}
