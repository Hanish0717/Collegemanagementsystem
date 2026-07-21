import { createFileRoute } from '@tanstack/react-router';
import { PrincipalDashboard } from '@/pages/principal/PrincipalDashboard';

export const Route = createFileRoute('/dashboard/principal')({
  component: PrincipalDashboard,
});
