import { createFileRoute } from "@tanstack/react-router";
import { AdminHealth } from '@/modules/admin/pages/AdminHealthPage';

export const Route = createFileRoute("/dashboard/admin/health")({
  component: AdminHealth,
});
