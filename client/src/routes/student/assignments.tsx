import { createFileRoute } from "@tanstack/react-router";
import { StudentAssignments } from "@/pages/student/StudentAssignments";

export const Route = createFileRoute("/student/assignments")({
  component: StudentAssignments,
});
