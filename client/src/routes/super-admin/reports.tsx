import { createFileRoute } from "@tanstack/react-router";
import { SuperAdminReports } from "@/pages/superAdmin/SuperAdminReports";

export const Route = createFileRoute("/super-admin/reports")({
  component: SuperAdminReports,
});
