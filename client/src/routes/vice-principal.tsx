import { createFileRoute } from '@tanstack/react-router';
import { VicePrincipalDashboard } from '@/pages/vicePrincipal/VicePrincipalDashboard';

export const Route = createFileRoute('/vice-principal')({
  component: VicePrincipalDashboard,
});
