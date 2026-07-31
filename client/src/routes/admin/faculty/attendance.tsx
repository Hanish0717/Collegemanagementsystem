import { createFileRoute } from "@tanstack/react-router";
import { AdminFacultyAttendance } from "@/pages/admin/AdminFacultyAttendance";

export const Route = createFileRoute("/admin/faculty/attendance")({
  component: AdminFacultyAttendance,
});
