import { createFileRoute } from '@tanstack/react-router';
import { HODDashboardPage } from '@/modules/hod/pages/HODDashboardPage';

export const Route = createFileRoute('/hod/dashboard')({
  component: HODDashboardPage,
});
