import { DashboardLayout } from "@/layouts/DashboardLayout";
import { createFileRoute } from "@tanstack/react-router";
import { NotificationsPage } from "@/pages/dashboard/NotificationsPage";

export const Route = createFileRoute("/notifications")({
  component: NotificationsPage,
});
