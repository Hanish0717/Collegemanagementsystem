import { createFileRoute } from "@tanstack/react-router";
import { StudentAttendance } from "@/pages/student/StudentAttendance";

export const Route = createFileRoute("/dashboard/student/attendance")({
  component: StudentAttendance,
});
