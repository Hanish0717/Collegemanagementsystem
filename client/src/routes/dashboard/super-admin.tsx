import { createFileRoute, redirect } from '@tanstack/react-router';
import { SuperAdminDashboard } from '@/pages/superAdmin/SuperAdminDashboard';
import { getStoredUser } from '@/services/authService';

export const Route = createFileRoute('/dashboard/super-admin')({
  beforeLoad: () => {
    const user = getStoredUser();
    if (!user || (user.role !== 'super-admin' && user.role !== 'super_admin')) {
      throw redirect({ to: '/dashboard' });
    }
  },
  component: SuperAdminDashboard,
});
