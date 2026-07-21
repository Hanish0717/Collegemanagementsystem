import { createFileRoute } from "@tanstack/react-router";
import { AdminStudents } from "@/pages/admin/AdminStudents";

export const Route = createFileRoute("/dashboard/admin/students")({
  component: AdminStudents,
});
