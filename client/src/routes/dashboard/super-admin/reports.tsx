import { createFileRoute } from "@tanstack/react-router";
import { SuperAdminReports } from "@/pages/superAdmin/SuperAdminReports";

export const Route = createFileRoute("/dashboard/super-admin/reports")({
  component: SuperAdminReports,
});
