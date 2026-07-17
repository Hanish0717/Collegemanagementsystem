import { createFileRoute } from '@tanstack/react-router';
import { StudentAssignments } from '@/pages/student/StudentAssignments';

export const Route = createFileRoute('/dashboard/student/assignments')({
  component: StudentAssignments,
});
