import { createFileRoute } from "@tanstack/react-router";
import { AdminApprovals } from "@/pages/admin/AdminApprovals";

export const Route = createFileRoute("/dashboard/admin/approvals")({
  component: AdminApprovals,
});
