import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "@/pages/admin/alumni/DashboardPage";

export const Route = createFileRoute("/dashboard/admin/alumni/")({
  component: DashboardPage,
});
