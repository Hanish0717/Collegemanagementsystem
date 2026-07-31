import { createFileRoute } from '@tanstack/react-router';
import { AdminPayroll } from '@/pages/admin/AdminPayroll';

export const Route = createFileRoute('/admin/payroll')({
  component: AdminPayroll,
});
