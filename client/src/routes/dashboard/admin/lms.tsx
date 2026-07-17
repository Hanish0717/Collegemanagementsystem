import { createFileRoute } from '@tanstack/react-router';
import { AdminLMS } from '@/pages/admin/AdminLMS';

export const Route = createFileRoute('/dashboard/admin/lms')({
  component: AdminLMS,
});
