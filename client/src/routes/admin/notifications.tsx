import { createFileRoute } from "@tanstack/react-router";
import { AdminNotifications } from "@/pages/admin/AdminNotifications";

export const Route = createFileRoute("/admin/notifications")({
  component: AdminNotifications,
});
