import { createFileRoute } from "@tanstack/react-router";
import { PlacementTargets } from "@/pages/placement/PlacementTargets";

export const Route = createFileRoute("/dashboard/placement/targets")({
  component: PlacementTargets,
});
