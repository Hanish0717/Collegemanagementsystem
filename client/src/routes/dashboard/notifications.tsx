import { createFileRoute } from "@tanstack/react-router";
import { NotificationsPage } from "@/pages/dashboard/NotificationsPage";

export const Route = createFileRoute("/dashboard/notifications")({
  component: NotificationsPage,
});
