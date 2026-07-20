import { createFileRoute } from '@tanstack/react-router';
import { AdminAdmissions } from '@/pages/admin/AdminAdmissions';

export const Route = createFileRoute('/dashboard/admin/admissions')({
  component: AdminAdmissions,
});
