import { createFileRoute } from "@tanstack/react-router";
import { SuperAdminConfiguration } from "@/pages/superAdmin/SuperAdminConfiguration";

export const Route = createFileRoute("/super-admin/configuration")({
  component: SuperAdminConfiguration,
});
