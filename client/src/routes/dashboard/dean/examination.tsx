import { createFileRoute } from '@tanstack/react-router';
import { DeanExaminationAdmin } from '@/pages/dean/DeanExaminationAdmin';
import { DeanModuleErrorBoundary } from '@/components/dean/DeanModuleErrorBoundary';

export const Route = createFileRoute('/dashboard/dean/examination')({
  errorComponent: DeanModuleErrorBoundary,
  component: DeanExaminationAdmin,
});
