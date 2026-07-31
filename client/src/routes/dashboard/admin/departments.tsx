import { createFileRoute } from "@tanstack/react-router";
import { AdminDepartments } from "@/pages/admin/AdminDepartments";

export const Route = createFileRoute("/dashboard/admin/departments")({
  component: AdminDepartments,
});
