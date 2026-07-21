import { createFileRoute } from '@tanstack/react-router';
import { DeanApprovals } from '@/pages/dean/DeanApprovals';
import { DeanModuleErrorBoundary } from '@/components/dean/DeanModuleErrorBoundary';

export const Route = createFileRoute('/dashboard/dean/approvals')({
  errorComponent: DeanModuleErrorBoundary,
  component: DeanApprovals,
});
