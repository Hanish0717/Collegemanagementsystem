import { createFileRoute } from "@tanstack/react-router";
import { StudentLMS } from "@/pages/student/StudentLMS";

export const Route = createFileRoute("/dashboard/student/lms")({
  component: StudentLMS,
});
