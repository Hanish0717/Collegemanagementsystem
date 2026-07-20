import { createFileRoute } from '@tanstack/react-router';
import { AdminClubs } from '@/pages/admin/AdminClubs';

export const Route = createFileRoute('/dashboard/admin/clubs')({
  component: AdminClubs,
});
