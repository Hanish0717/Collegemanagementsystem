import { createFileRoute } from "@tanstack/react-router";
import { ReportsPage } from '@/pages/admin/alumni/ReportsPage';

export const Route = createFileRoute("/dashboard/admin/alumni/reports")({
  component: ReportsPage,
});
