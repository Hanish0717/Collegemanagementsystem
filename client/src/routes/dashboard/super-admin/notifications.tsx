import { createFileRoute } from "@tanstack/react-router";
import { SuperAdminNotifications } from "@/pages/superAdmin/SuperAdminNotifications";

export const Route = createFileRoute("/dashboard/super-admin/notifications")({
  component: SuperAdminNotifications,
});
