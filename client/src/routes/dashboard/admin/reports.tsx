import { createFileRoute } from "@tanstack/react-router";
import { AdminReports } from '@/modules/admin/pages/AdminReportsPage';

export const Route = createFileRoute("/dashboard/admin/reports")({
  component: AdminReports,
});
