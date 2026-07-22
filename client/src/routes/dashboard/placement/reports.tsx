import { createFileRoute } from "@tanstack/react-router";
import { PlacementReports } from "@/pages/placement/PlacementReports";

export const Route = createFileRoute("/dashboard/placement/reports")({
  component: PlacementReports,
});
