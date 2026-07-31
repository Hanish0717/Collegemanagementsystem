import { createFileRoute } from '@tanstack/react-router';
import { SuperAdminDashboard } from '@/pages/superAdmin/SuperAdminDashboard';

export const Route = createFileRoute('/super-admin/')({
  component: SuperAdminDashboard,
});
