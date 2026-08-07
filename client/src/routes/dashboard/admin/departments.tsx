import { createFileRoute } from "@tanstack/react-router";
import { AdminDepartments } from '@/modules/admin/pages/AdminDepartmentsPage';

export const Route = createFileRoute("/dashboard/admin/departments")({
  component: AdminDepartments,
});
