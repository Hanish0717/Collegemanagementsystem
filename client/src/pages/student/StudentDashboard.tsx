import { Outlet, useRouterState } from '@tanstack/react-router';
import { StudentPortal } from './StudentPortal';

export function StudentDashboard() {
  const routerState = useRouterState();
  const path = routerState.location.pathname;

  if (path !== '/dashboard/student' && path !== '/dashboard/student/' && path !== '/dashboard') {
    return <Outlet />;
  }

  return <StudentPortal />;
}
