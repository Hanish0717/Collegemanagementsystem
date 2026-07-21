import { createFileRoute } from "@tanstack/react-router";
import { PlacementApplications } from "@/pages/placement/PlacementApplications";

export const Route = createFileRoute("/dashboard/placement/applications")({
  component: PlacementApplications,
});
