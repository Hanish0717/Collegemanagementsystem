import { createFileRoute } from '@tanstack/react-router';
import { FacultyPayroll } from '@/pages/faculty/FacultyPayroll';

export const Route = createFileRoute('/dashboard/faculty/payroll')({
  component: FacultyPayroll,
});
