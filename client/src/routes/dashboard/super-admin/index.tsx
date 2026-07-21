import { createFileRoute } from '@tanstack/react-router';
import { SuperAdminDashboard } from '@/pages/superAdmin/SuperAdminDashboard';

export const Route = createFileRoute('/dashboard/super-admin/')({
  component: SuperAdminDashboard,
});
