import { createFileRoute } from '@tanstack/react-router';
import { DeanIMAAdmin } from '@/pages/dean/DeanIMAAdmin';
import { DeanModuleErrorBoundary } from '@/components/dean/DeanModuleErrorBoundary';

export const Route = createFileRoute('/dean/ima')({
  errorComponent: DeanModuleErrorBoundary,
  component: DeanIMAAdmin,
});
