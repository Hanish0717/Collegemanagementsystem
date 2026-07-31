import { createFileRoute } from "@tanstack/react-router";
import { PlacementReports } from "@/pages/placement/PlacementReports";

export const Route = createFileRoute("/placement/reports")({
  component: PlacementReports,
});
