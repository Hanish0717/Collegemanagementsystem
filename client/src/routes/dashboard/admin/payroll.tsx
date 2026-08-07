import { createFileRoute } from '@tanstack/react-router';
import { AdminPayroll } from '@/modules/admin/pages/AdminPayrollPage';

export const Route = createFileRoute('/dashboard/admin/payroll')({
  component: AdminPayroll,
});
