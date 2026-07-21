import { createFileRoute } from '@tanstack/react-router';
import { FacultyPayroll } from '@/pages/faculty/FacultyPayroll';

export const Route = createFileRoute('/faculty/payroll')({
  component: FacultyPayroll,
});
