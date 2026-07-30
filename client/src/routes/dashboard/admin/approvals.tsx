import { createFileRoute } from "@tanstack/react-router";
import { AdminApprovals } from '@/modules/admin/pages/AdminApprovalsPage';

export const Route = createFileRoute("/dashboard/admin/approvals")({
  component: AdminApprovals,
});
