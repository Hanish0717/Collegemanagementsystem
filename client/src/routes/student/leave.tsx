import { createFileRoute } from "@tanstack/react-router";
import { StudentLeave } from "@/pages/student/StudentLeave";

export const Route = createFileRoute("/student/leave")({
  component: StudentLeave,
});
