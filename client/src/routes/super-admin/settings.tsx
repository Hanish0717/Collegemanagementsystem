import { createFileRoute } from "@tanstack/react-router";
import { SuperAdminSettings } from "@/pages/superAdmin/SuperAdminSettings";

export const Route = createFileRoute("/super-admin/settings")({
  component: SuperAdminSettings,
});
