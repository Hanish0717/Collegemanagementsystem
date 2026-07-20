import { createFileRoute } from '@tanstack/react-router';
import { ExamResults } from '@/pages/admin/exams/ExamResults';

export const Route = createFileRoute('/dashboard/admin/exams/results')({
  component: ExamResults,
});
