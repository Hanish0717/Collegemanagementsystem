import { createFileRoute } from '@tanstack/react-router';
import { DeanIQACAdmin } from '@/pages/dean/DeanIQACAdmin';
import { DeanModuleErrorBoundary } from '@/components/dean/DeanModuleErrorBoundary';

export const Route = createFileRoute('/dashboard/dean/iqac')({
  errorComponent: DeanModuleErrorBoundary,
  component: DeanIQACAdmin,
});
