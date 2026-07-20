import { createFileRoute } from '@tanstack/react-router';
import { ExamInvigilation } from '@/pages/admin/exams/ExamInvigilation';

export const Route = createFileRoute('/dashboard/admin/exams/invigilation')({
  component: ExamInvigilation,
});
