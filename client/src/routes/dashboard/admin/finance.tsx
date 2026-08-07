import { createFileRoute } from "@tanstack/react-router";
import { AdminFinance } from '@/modules/admin/pages/AdminFinancePage';

export const Route = createFileRoute("/dashboard/admin/finance")({
  component: AdminFinance,
});
