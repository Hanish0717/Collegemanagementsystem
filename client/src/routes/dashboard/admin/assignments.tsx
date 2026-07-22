import { createFileRoute } from "@tanstack/react-router";
import { FacultyAssignments } from "@/pages/admin/FacultyAssignments";

export const Route = createFileRoute("/dashboard/admin/assignments")({
  component: FacultyAssignments,
});
