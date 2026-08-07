import { createFileRoute } from "@tanstack/react-router";
import { ExamQuestions } from '@/pages/admin/exams/ExamQuestions';

export const Route = createFileRoute("/dashboard/admin/exams/questions")({
  component: ExamQuestions,
});
