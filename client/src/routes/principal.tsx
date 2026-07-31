import { DashboardLayout } from "@/layouts/DashboardLayout";
import { createFileRoute } from '@tanstack/react-router';
import { PrincipalDashboard } from '@/pages/principal/PrincipalDashboard';

export const Route = createFileRoute('/principal')({
  component: PrincipalDashboard,
});
