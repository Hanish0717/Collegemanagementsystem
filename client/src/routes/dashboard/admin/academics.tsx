import { createFileRoute } from '@tanstack/react-router';
import { AdminAcademics } from '@/modules/admin/pages/AdminAcademicsPage';

export const Route = createFileRoute('/dashboard/admin/academics')({
  component: AdminAcademics,
});
