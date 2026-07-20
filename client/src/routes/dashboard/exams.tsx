import { createFileRoute } from '@tanstack/react-router';
import { ExamsPage } from '@/pages/dashboard/ExamsPage';

export const Route = createFileRoute('/dashboard/exams')({
  component: ExamsPage,
});
