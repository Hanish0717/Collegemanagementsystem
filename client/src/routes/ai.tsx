import { createFileRoute, Outlet, useRouterState } from '@tanstack/react-router';
import { AiDashboard } from '@/pages/ai/AiDashboard';

function AiLayout() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  if (path === '/dashboard/ai' || path === '/dashboard/ai/') {
    return <AiDashboard />;
  }
  return <Outlet />;
}

export const Route = createFileRoute('/ai')({
  component: AiLayout,
});

