import { createFileRoute } from '@tanstack/react-router';
import { DeanDashboard } from '@/pages/dashboard/DeanDashboard';
import { DeanModuleErrorBoundary } from '@/components/dean/DeanModuleErrorBoundary';

export const Route = createFileRoute('/dashboard/dean/')({
  errorComponent: DeanModuleErrorBoundary,
  component: DeanDashboard,
});
