import { createFileRoute } from "@tanstack/react-router";
import { NotificationsPage } from "@/pages/admin/alumni/NotificationsPage";

export const Route = createFileRoute("/admin/alumni/notifications")({
  component: NotificationsPage,
});
