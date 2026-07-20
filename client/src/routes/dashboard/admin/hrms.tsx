import { createFileRoute } from '@tanstack/react-router';
import { AdminHRMS } from '@/pages/admin/AdminHRMS';

export const Route = createFileRoute('/dashboard/admin/hrms')({
  component: AdminHRMS,
});
