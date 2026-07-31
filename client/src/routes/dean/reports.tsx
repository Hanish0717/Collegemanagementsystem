import { createFileRoute } from '@tanstack/react-router';
import { DeanReports } from '@/pages/dean/DeanReports';
import { DeanModuleErrorBoundary } from '@/components/dean/DeanModuleErrorBoundary';

export const Route = createFileRoute('/dean/reports')({
  errorComponent: DeanModuleErrorBoundary,
  component: DeanReports,
});
