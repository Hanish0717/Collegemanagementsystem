import { createFileRoute } from "@tanstack/react-router";
import { FacultyAssignments } from "@/pages/admin/FacultyAssignments";

export const Route = createFileRoute("/admin/assignments")({
  component: FacultyAssignments,
});
