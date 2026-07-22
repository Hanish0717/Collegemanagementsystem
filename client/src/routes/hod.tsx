import { createFileRoute, redirect } from '@tanstack/react-router';
import { isAuthenticated } from '@/services/authService';
import { getActiveRole } from '@/lib/roles';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { HODDepartmentProvider } from '@/modules/hod/hooks/useHODDepartment';

export const Route = createFileRoute('/hod')({
  beforeLoad: ({ location }) => {
    if (!isAuthenticated()) {
      throw redirect({ to: '/login' });
    }

    const roleObj = getActiveRole();
    const role = roleObj.id;

    const userRaw = typeof window !== 'undefined' ? localStorage.getItem('cms_user') : null;
    let userRole = '';
    if (userRaw) {
      try {
        const u = JSON.parse(userRaw);
        userRole = String(u.role || '').toLowerCase().trim().replace(/-/g, '_');
      } catch {}
    }

    const allowedRoles = ['hod', 'principal', 'super_admin', 'admin', 'head_of_department'];
    const isAllowed = allowedRoles.includes(role) || allowedRoles.includes(userRole);

    // If accessing /hod/403 or /hod/404, allow rendering
    if (location.pathname === '/hod/403' || location.pathname === '/hod/404') {
      return;
    }

    if (!isAllowed) {
      throw redirect({ to: '/hod/403' });
    }
  },
  component: HODRouteLayout,
});

function HODRouteLayout() {
  return (
    <HODDepartmentProvider>
      <DashboardLayout />
    </HODDepartmentProvider>
  );
}
