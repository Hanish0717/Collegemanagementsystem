import { createFileRoute } from '@tanstack/react-router';
import { DeanStudentAdmin } from '@/pages/dean/DeanStudentAdmin';
import { DeanModuleErrorBoundary } from '@/components/dean/DeanModuleErrorBoundary';

export const Route = createFileRoute('/dean/student')({
  errorComponent: DeanModuleErrorBoundary,
  component: DeanStudentAdmin,
});
