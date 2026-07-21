import { createFileRoute } from "@tanstack/react-router";
import { AdminReports } from "@/pages/admin/AdminReports";

export const Route = createFileRoute("/dashboard/admin/reports")({
  component: AdminReports,
});
