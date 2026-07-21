import { createFileRoute } from '@tanstack/react-router';
import { AdminPayroll } from '@/pages/admin/AdminPayroll';

export const Route = createFileRoute('/dashboard/faculty/payroll')({
  component: AdminPayroll,
});
