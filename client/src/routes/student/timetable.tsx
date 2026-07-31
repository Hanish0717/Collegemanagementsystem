import { createFileRoute } from "@tanstack/react-router";
import { StudentTimetable } from "@/pages/student/StudentTimetable";

export const Route = createFileRoute("/student/timetable")({
  component: StudentTimetable,
});
