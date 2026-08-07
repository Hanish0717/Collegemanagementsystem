import { createFileRoute } from '@tanstack/react-router';
import { AdminDashboard } from '@/modules/admin/pages/AdminDashboardPage';

export const Route = createFileRoute('/dashboard/admin/')({
  component: AdminDashboard,
});
