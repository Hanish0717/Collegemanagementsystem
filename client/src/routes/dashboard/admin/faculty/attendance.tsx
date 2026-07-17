import { createFileRoute } from '@tanstack/react-router';
import { AdminFacultyAttendance } from '@/pages/admin/AdminFacultyAttendance';

export const Route = createFileRoute('/dashboard/admin/faculty/attendance')({
  component: AdminFacultyAttendance,
});
