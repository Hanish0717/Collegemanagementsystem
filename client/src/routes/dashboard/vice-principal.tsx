import { createFileRoute } from '@tanstack/react-router';
import { VicePrincipalDashboard } from '@/pages/vicePrincipal/VicePrincipalDashboard';

export const Route = createFileRoute('/dashboard/vice-principal')({
  component: VicePrincipalDashboard,
});
