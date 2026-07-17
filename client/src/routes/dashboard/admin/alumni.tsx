import { createFileRoute } from '@tanstack/react-router';
import { AdminAlumni } from '@/pages/admin/AdminAlumni';

export const Route = createFileRoute('/dashboard/admin/alumni')({
  component: AdminAlumni,
});
