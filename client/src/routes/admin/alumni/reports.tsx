import { createFileRoute } from "@tanstack/react-router";
import { ReportsPage } from "@/pages/admin/alumni/ReportsPage";

export const Route = createFileRoute("/admin/alumni/reports")({
  component: ReportsPage,
});
