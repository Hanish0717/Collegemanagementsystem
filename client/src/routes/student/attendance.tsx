import { createFileRoute } from "@tanstack/react-router";
import { StudentAttendance } from "@/pages/student/StudentAttendance";

export const Route = createFileRoute("/student/attendance")({
  component: StudentAttendance,
});
