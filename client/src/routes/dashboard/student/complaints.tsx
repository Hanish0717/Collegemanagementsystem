import { createFileRoute } from '@tanstack/react-router';
import { StudentComplaints } from '@/pages/student/StudentComplaints';

export const Route = createFileRoute('/dashboard/student/complaints')({
  component: StudentComplaints,
});
