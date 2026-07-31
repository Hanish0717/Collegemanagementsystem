import { createFileRoute } from "@tanstack/react-router";
import { ExamSchedule } from "@/pages/admin/exams/ExamSchedule";

export const Route = createFileRoute("/admin/exams/schedule")({
  component: ExamSchedule,
});
