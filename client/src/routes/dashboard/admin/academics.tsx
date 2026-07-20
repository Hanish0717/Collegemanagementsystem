import { createFileRoute } from '@tanstack/react-router';
import { AdminAcademics } from '@/pages/admin/AdminAcademics';

export const Route = createFileRoute('/dashboard/admin/academics')({
  component: AdminAcademics,
});
