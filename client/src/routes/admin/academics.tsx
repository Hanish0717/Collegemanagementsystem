import { createFileRoute } from '@tanstack/react-router';
import { AdminAcademics } from '@/pages/admin/AdminAcademics';

export const Route = createFileRoute('/admin/academics')({
  component: AdminAcademics,
});
