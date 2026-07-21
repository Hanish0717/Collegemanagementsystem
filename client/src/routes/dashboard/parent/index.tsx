import { createFileRoute } from '@tanstack/react-router';
import { ParentDashboard } from '@/pages/parent/ParentDashboard';

export const Route = createFileRoute('/dashboard/parent/')({
  component: ParentDashboard,
});
