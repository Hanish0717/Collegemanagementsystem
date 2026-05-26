import { createFileRoute } from "@tanstack/react-router";
import { PlacementSettings } from "@/pages/placement/PlacementSettings";

export const Route = createFileRoute("/dashboard/placement/settings")({
  component: PlacementSettings,
});
