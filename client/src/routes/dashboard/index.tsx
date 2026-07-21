import { createFileRoute } from "@tanstack/react-router";
import { DashboardIndex } from "@/pages/dashboard/DashboardIndex";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardIndex,
});

