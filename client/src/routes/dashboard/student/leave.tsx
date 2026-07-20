import { createFileRoute } from '@tanstack/react-router';
import { StudentLeave } from '@/pages/student/StudentLeave';

export const Route = createFileRoute('/dashboard/student/leave')({
  component: StudentLeave,
});
