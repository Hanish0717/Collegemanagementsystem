import { DashboardLayout } from "@/layouts/DashboardLayout";
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { isAuthenticated } from '@/services/authService';

export const Route = createFileRoute('/librarian')({
  beforeLoad: () => {
    if (!isAuthenticated()) {
      throw redirect({ to: '/login' });
    }
  },
  component: DashboardLayout,
});

