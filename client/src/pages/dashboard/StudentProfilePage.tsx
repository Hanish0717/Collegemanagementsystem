import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, ArrowLeft, Edit, Loader2, Trash2, UserRound } from 'lucide-react';
import { Badge, Card, PageHeader } from '@/components/dashboard/ui';
import { StudentDeleteAlert, StudentFormModal } from './students/StudentDialogs';
import {
  deleteStudent,
  fetchDepartments,
  fetchStudentById,
  getStudentDisplayStatus,
  updateStudent,
  type StudentPayload,
} from '@/services/studentService';
import { toast } from 'sonner';

interface StudentProfilePageProps {
  studentId: string;
}

const displayDepartment = (
  departmentCode: string,
  departments: Array<{ code: string; name: string }>,
) => departments.find((department) => department.code === departmentCode)?.name ?? departmentCode;

export function StudentProfilePage({ studentId }: StudentProfilePageProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: fetchDepartments,
  });

  const {
    data: student,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['student', studentId],
    queryFn: () => fetchStudentById(studentId),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: StudentPayload) => updateStudent(studentId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['students'] });
      await queryClient.invalidateQueries({ queryKey: ['student', studentId] });
      toast.success('Student profile updated');
      setIsEditOpen(false);
    },
    onError: (mutationError: unknown) => {
      const message =
        mutationError instanceof Error ? mutationError.message : 'Failed to update profile';
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteStudent(studentId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student deleted successfully');
      navigate({ to: '/dashboard/students' });
    },
    onError: (mutationError: unknown) => {
      const message =
        mutationError instanceof Error ? mutationError.message : 'Failed to delete student';
      toast.error(message);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Student Profile"
          desc="View and manage student details."
          actions={
            <button
              onClick={() => navigate({ to: '/dashboard/students' })}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm bg-background/60"
            >
              <ArrowLeft className="size-4" /> Back
            </button>
          }
        />
        <Card className="py-12 flex flex-col items-center justify-center gap-2">
          <Loader2 className="size-8 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Loading profile...</span>
        </Card>
      </div>
    );
  }

  if (isError || !student) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Student Profile"
          desc="View and manage student details."
          actions={
            <button
              onClick={() => navigate({ to: '/dashboard/students' })}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm bg-background/60"
            >
              <ArrowLeft className="size-4" /> Back
            </button>
          }
        />
        <Card className="py-12 text-center space-y-3">
          <AlertCircle className="size-8 mx-auto text-rose-500" />
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'Student profile could not be loaded.'}
          </p>
          <button
            onClick={() => navigate({ to: '/dashboard/students' })}
            className="px-4 py-2 rounded-xl border text-sm hover:bg-accent"
          >
            Back to students
          </button>
        </Card>
      </div>
    );
  }

  const status = getStudentDisplayStatus(student);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Profile"
        desc="View and manage student details."
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => navigate({ to: '/dashboard/students' })}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm bg-background/60"
            >
              <ArrowLeft className="size-4" /> Back
            </button>
            <button
              onClick={() => setIsEditOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-primary text-white text-sm glow-primary"
            >
              <Edit className="size-4" /> Edit Student
            </button>
            <button
              onClick={() => setIsDeleteOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm text-rose-600 bg-background/60"
            >
              <Trash2 className="size-4" /> Delete Student
            </button>
          </div>
        }
      />

      <div className="grid lg:grid-cols-[1.4fr_0.9fr] gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="size-16 rounded-2xl bg-gradient-primary text-white grid place-items-center text-xl font-bold">
                {student.fullName
                  .split(' ')
                  .filter(Boolean)
                  .map((part) => part[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{student.fullName}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {displayDepartment(student.department, departments)} · Roll {student.rollNumber}
                </p>
              </div>
            </div>
            <Badge
              tone={status === 'Active' ? 'success' : status === 'Warning' ? 'warn' : 'danger'}
            >
              {status}
            </Badge>
          </div>

          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
            <div className="p-4 rounded-xl bg-gradient-soft border">
              <div className="text-xs text-muted-foreground">Attendance</div>
              <div className="text-2xl font-bold mt-1">{student.attendancePercentage ?? 0}%</div>
            </div>
            <div className="p-4 rounded-xl bg-gradient-soft border">
              <div className="text-xs text-muted-foreground">CGPA</div>
              <div className="text-2xl font-bold mt-1">{(student.cgpa ?? 0).toFixed(2)}</div>
            </div>
            <div className="p-4 rounded-xl bg-gradient-soft border">
              <div className="text-xs text-muted-foreground">Year / Semester</div>
              <div className="text-2xl font-bold mt-1">
                Y{student.year} / S{student.semester}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-gradient-soft border">
              <div className="text-xs text-muted-foreground">Section</div>
              <div className="text-2xl font-bold mt-1">{student.section}</div>
            </div>
          </div>

          <div className="mt-6 grid md:grid-cols-2 gap-4 text-sm">
            {[
              ['Email', student.email],
              ['Phone', student.phoneNumber ?? '-'],
              ['Admission Number', student.admissionNumber ?? '-'],
              ['Parent Email', student.parentEmail ?? '-'],
              ['Parent Name', student.parentName],
              ['Parent Phone', student.parentPhone],
              ['Date of Birth', student.dateOfBirth ?? '-'],
              ['Department', displayDepartment(student.department, departments)],
            ].map(([label, value]) => (
              <div key={label} className="p-4 rounded-xl border bg-gradient-soft">
                <div className="text-xs text-muted-foreground">{label}</div>
                <div className="font-medium mt-1">{value}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <UserRound className="size-5 text-indigo" />
            <h3 className="font-semibold">Academic Snapshot</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-soft border">
              <span className="text-sm text-muted-foreground">Current Status</span>
              <span className="font-bold">{status}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-soft border">
              <span className="text-sm text-muted-foreground">Attendance Progress</span>
              <span className="font-bold">{student.attendancePercentage ?? 0}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-primary"
                style={{ width: `${Math.min(student.attendancePercentage ?? 0, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-soft border">
              <span className="text-sm text-muted-foreground">CGPA Score</span>
              <span className="font-bold">{(student.cgpa ?? 0).toFixed(2)}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-violet"
                style={{ width: `${Math.min((student.cgpa ?? 0) * 10, 100)}%` }}
              />
            </div>
          </div>
        </Card>
      </div>

      <StudentFormModal
        open={isEditOpen}
        mode="edit"
        student={student}
        departments={departments}
        submitting={updateMutation.isPending}
        onClose={() => setIsEditOpen(false)}
        onSubmit={(payload) => updateMutation.mutate(payload)}
      />

      <StudentDeleteAlert
        open={isDeleteOpen}
        studentName={student.fullName}
        loading={deleteMutation.isPending}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
      />
    </div>
  );
}
