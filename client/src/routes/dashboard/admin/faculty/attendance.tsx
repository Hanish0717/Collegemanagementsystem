import { createFileRoute } from "@tanstack/react-router";
import { AdminFacultyAttendance } from '@/modules/admin/pages/AdminFacultyAttendancePage';

export const Route = createFileRoute("/dashboard/admin/faculty/attendance")({
  component: AdminFacultyAttendance,
});
