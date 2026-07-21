import { createFileRoute, redirect } from '@tanstack/react-router';
import { isAuthenticated } from '@/services/authService';
import { DashboardLayout } from '@/layouts/DashboardLayout';

export const Route = createFileRoute('/faculty')({
  beforeLoad: () => {
    if (!isAuthenticated()) {
      throw redirect({ to: '/login' });
    }
  },
  component: DashboardLayout,
});
