import { createFileRoute } from "@tanstack/react-router";
import { StudentProfile } from "@/pages/student/StudentProfile";

export const Route = createFileRoute("/dashboard/student/profile")({
  component: StudentProfile,
});
