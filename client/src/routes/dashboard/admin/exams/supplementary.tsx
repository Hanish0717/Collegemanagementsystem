import { createFileRoute } from "@tanstack/react-router";
import { ExamSupplementary } from '@/pages/admin/exams/ExamSupplementary';

export const Route = createFileRoute("/dashboard/admin/exams/supplementary")({
  component: ExamSupplementary,
});
