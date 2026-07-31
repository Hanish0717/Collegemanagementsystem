import { createFileRoute } from "@tanstack/react-router";
import { StudentDashboard } from "@/pages/student/StudentDashboard";

export const Route = createFileRoute("/student/")({
  component: StudentDashboard,
});
