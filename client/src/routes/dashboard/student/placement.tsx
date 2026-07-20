import { createFileRoute } from '@tanstack/react-router';
import { StudentPlacement } from '@/pages/student/StudentPlacement';

export const Route = createFileRoute('/dashboard/student/placement')({
  component: StudentPlacement,
});
