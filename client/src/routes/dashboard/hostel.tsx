import { createFileRoute, redirect } from '@tanstack/react-router';
import { HostelDashboard } from '@/pages/hostel/HostelDashboard';
import { getStoredUser } from '@/services/authService';

export const Route = createFileRoute('/dashboard/hostel')({
  beforeLoad: () => {
    const user = getStoredUser();
    const allowedRoles = ['hostel-warden', 'warden', 'admin', 'super-admin', 'principal'];
    if (!user || !allowedRoles.includes(user.role)) {
      throw redirect({ to: '/dashboard' });
    }
  },
  component: HostelDashboard,
});
