import { createFileRoute } from "@tanstack/react-router";
import { AdminFees } from "@/pages/admin/AdminFees";

export const Route = createFileRoute("/admin/fees")({
  component: AdminFees,
});
