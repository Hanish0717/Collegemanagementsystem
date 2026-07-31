import { createFileRoute } from "@tanstack/react-router";
import { AdminHealth } from "@/pages/admin/AdminHealth";

export const Route = createFileRoute("/admin/health")({
  component: AdminHealth,
});
