import { createFileRoute, redirect } from '@tanstack/react-router';
import { TransportDashboard } from '@/pages/transport/TransportDashboard';
import { getStoredUser } from '@/services/authService';

export const Route = createFileRoute('/dashboard/transport')({
  beforeLoad: () => {
    const user = getStoredUser();
    const allowedRoles = ['transport-manager', 'transport', 'admin', 'super-admin', 'principal'];
    if (!user || !allowedRoles.includes(user.role)) {
      throw redirect({ to: '/dashboard' });
    }
  },
  component: TransportDashboard,
});
