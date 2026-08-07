import { createFileRoute } from "@tanstack/react-router";
import { AdminStudents } from '@/modules/admin/pages/AdminStudentsPage';

export const Route = createFileRoute("/dashboard/admin/students")({
  component: AdminStudents,
});
