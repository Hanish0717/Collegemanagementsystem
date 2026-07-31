import { createFileRoute } from "@tanstack/react-router";
import { ExamTimetable } from "@/pages/admin/exams/ExamTimetable";

export const Route = createFileRoute("/admin/exams/timetable")({
  component: ExamTimetable,
});
