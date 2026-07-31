import { createFileRoute, Outlet, useRouterState } from '@tanstack/react-router';
import { AdminFaculty } from '@/pages/admin/AdminFaculty';

function AdminFacultyLayout() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  if (path === '/admin/faculty' || path === '/admin/faculty/') {
    return <AdminFaculty />;
  }
  return <Outlet />;
}

export const Route = createFileRoute('/admin/faculty')({
  component: AdminFacultyLayout,
});
