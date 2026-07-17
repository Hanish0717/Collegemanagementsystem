import { createFileRoute } from '@tanstack/react-router';
import { StudentResults } from '@/pages/student/StudentResults';

export const Route = createFileRoute('/dashboard/student/results')({
  component: StudentResults,
});
