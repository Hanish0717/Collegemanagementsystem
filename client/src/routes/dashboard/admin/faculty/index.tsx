import { createFileRoute } from "@tanstack/react-router";
import { AdminFaculty } from '@/modules/admin/pages/AdminFacultyPage';

export const Route = createFileRoute("/dashboard/admin/faculty/")({
  component: AdminFaculty,
});
