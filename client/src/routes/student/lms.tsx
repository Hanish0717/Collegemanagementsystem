import { createFileRoute } from "@tanstack/react-router";
import { StudentLMS } from "@/pages/student/StudentLMS";

export const Route = createFileRoute("/student/lms")({
  component: StudentLMS,
});
