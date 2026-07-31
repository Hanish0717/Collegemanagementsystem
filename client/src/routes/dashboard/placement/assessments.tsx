import { createFileRoute } from '@tanstack/react-router';
import { AssessmentManagementPage } from '@/modules/assessment/pages/AssessmentManagementPage';

export const Route = createFileRoute('/dashboard/placement/assessments')({
  component: () => <AssessmentManagementPage userRole="placement" />
});
