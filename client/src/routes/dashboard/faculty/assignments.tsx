import { createFileRoute } from "@tanstack/react-router";
import { FacultyAssignments } from "@/pages/faculty/FacultyAssignments";

export const Route = createFileRoute("/dashboard/faculty/assignments")({
  component: FacultyAssignments,
});
