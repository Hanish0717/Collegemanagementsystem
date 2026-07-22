import { createFileRoute, Outlet, useRouterState } from '@tanstack/react-router';
import { AdminFaculty } from '@/pages/admin/AdminFaculty';

export function AdminFacultyLayout() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  if (path === '/dashboard/admin/faculty' || path === '/dashboard/admin/faculty/') {
    return <AdminFaculty />;
  }
  return <Outlet />;
}

export const Route = createFileRoute('/dashboard/admin/faculty')({
  component: AdminFacultyLayout,
});
