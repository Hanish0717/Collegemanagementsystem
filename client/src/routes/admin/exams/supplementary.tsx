import { createFileRoute } from "@tanstack/react-router";
import { ExamSupplementary } from "@/pages/admin/exams/ExamSupplementary";

export const Route = createFileRoute("/admin/exams/supplementary")({
  component: ExamSupplementary,
});
