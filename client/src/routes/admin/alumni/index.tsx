import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "@/pages/admin/alumni/DashboardPage";

export const Route = createFileRoute("/admin/alumni/")({
  component: DashboardPage,
});
