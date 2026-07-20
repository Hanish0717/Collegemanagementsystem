import { createFileRoute } from '@tanstack/react-router';
import { AdminHealth } from '@/pages/admin/AdminHealth';

export const Route = createFileRoute('/dashboard/admin/health')({
  component: AdminHealth,
});
