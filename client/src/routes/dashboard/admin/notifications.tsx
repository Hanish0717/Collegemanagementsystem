import { createFileRoute } from "@tanstack/react-router";
import { AdminNotifications } from '@/modules/admin/pages/AdminNotificationsPage';

export const Route = createFileRoute("/dashboard/admin/notifications")({
  component: AdminNotifications,
});
