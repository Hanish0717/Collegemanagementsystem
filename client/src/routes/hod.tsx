import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { isAuthenticated } from '@/services/authService';
import { getActiveRole } from '@/lib/roles';
import { HODLayout } from '@/modules/hod/components/layout/HODLayout';

export const Route = createFileRoute('/hod')({
  beforeLoad: ({ location }) => {
    if (!isAuthenticated()) {
      throw redirect({ to: '/login' });
    }

    const roleObj = getActiveRole();
    const role = roleObj.id;
    const allowedRoles = ['hod', 'principal', 'super_admin', 'admin'];

    // If accessing /hod/403 or /hod/404, allow rendering
    if (location.pathname === '/hod/403' || location.pathname === '/hod/404') {
      return;
    }

    if (!allowedRoles.includes(role)) {
      throw redirect({ to: '/hod/403' });
    }
  },
  component: HODRouteLayout,
});

function HODRouteLayout() {
  return (
    <HODLayout>
      <Outlet />
    </HODLayout>
  );
}
