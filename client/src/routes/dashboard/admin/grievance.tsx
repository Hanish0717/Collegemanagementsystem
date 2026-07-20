import { createFileRoute } from '@tanstack/react-router';
import { AdminGrievance } from '@/pages/admin/AdminGrievance';

export const Route = createFileRoute('/dashboard/admin/grievance')({
  component: AdminGrievance,
});
