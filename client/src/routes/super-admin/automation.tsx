import { createFileRoute } from "@tanstack/react-router";
import { SuperAdminAutomation } from "@/pages/superAdmin/SuperAdminAutomation";

export const Route = createFileRoute("/super-admin/automation")({
  component: SuperAdminAutomation,
});
