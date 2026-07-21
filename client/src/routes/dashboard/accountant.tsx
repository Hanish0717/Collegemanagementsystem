import { createFileRoute } from '@tanstack/react-router';
import { AccountantDashboard } from '@/pages/accountant/AccountantDashboard';

export const Route = createFileRoute('/dashboard/accountant')({
  component: AccountantDashboard,
});
