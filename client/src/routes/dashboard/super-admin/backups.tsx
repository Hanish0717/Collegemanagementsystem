import { createFileRoute } from "@tanstack/react-router";
import { SuperAdminBackups } from "@/pages/superAdmin/SuperAdminBackups";

export const Route = createFileRoute("/dashboard/super-admin/backups")({
  component: SuperAdminBackups,
});
