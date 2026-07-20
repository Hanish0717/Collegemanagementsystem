import { createFileRoute, redirect } from '@tanstack/react-router';
import { PlacementDashboard } from '@/pages/placement/PlacementDashboard';
import { getStoredUser } from '@/services/authService';

export const Route = createFileRoute('/dashboard/placement')({
  beforeLoad: () => {
    const user = getStoredUser();
    const allowedRoles = ['placement-officer', 'placement', 'admin', 'super-admin', 'principal'];
    if (!user || !allowedRoles.includes(user.role)) {
      throw redirect({ to: '/dashboard' });
    }
  },
  component: PlacementDashboard,
});
