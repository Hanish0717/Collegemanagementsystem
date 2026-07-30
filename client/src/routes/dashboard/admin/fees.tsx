import { createFileRoute } from "@tanstack/react-router";
import { AdminFees } from '@/modules/admin/pages/AdminFeesPage';

export const Route = createFileRoute("/dashboard/admin/fees")({
  component: AdminFees,
});
