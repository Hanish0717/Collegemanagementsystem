import { createFileRoute } from "@tanstack/react-router";
import { FacultyAssignments } from '@/modules/admin/pages/FacultyAssignmentsPage';

export const Route = createFileRoute("/dashboard/admin/assignments")({
  component: FacultyAssignments,
});
