import { createFileRoute } from "@tanstack/react-router";
import { PlacementAlumniHiring } from "@/pages/placement/PlacementAlumniHiring";

export const Route = createFileRoute("/dashboard/placement/alumni")({
  component: PlacementAlumniHiring,
});
