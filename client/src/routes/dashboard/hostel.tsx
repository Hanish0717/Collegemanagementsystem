import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { getStoredUser } from '@/services/authService';

export const Route = createFileRoute('/dashboard/hostel')({
  beforeLoad: () => {
    const user = getStoredUser();
    const allowedRoles = ['hostel-warden', 'warden', 'admin', 'super-admin', 'principal'];
    if (!user || !allowedRoles.includes(user.role)) {
      throw redirect({ to: '/dashboard' });
    }
  },
  component: Outlet,
});

