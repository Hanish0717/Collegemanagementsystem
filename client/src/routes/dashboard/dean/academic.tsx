import { createFileRoute } from '@tanstack/react-router';
import { DeanAcademicAdmin } from '@/pages/dean/DeanAcademicAdmin';
import { DeanModuleErrorBoundary } from '@/components/dean/DeanModuleErrorBoundary';

export const Route = createFileRoute('/dashboard/dean/academic')({
  errorComponent: DeanModuleErrorBoundary,
  component: DeanAcademicAdmin,
});
