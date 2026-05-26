import { createFileRoute } from "@tanstack/react-router";
import { PlacementResume } from "@/pages/placement/PlacementResume";

export const Route = createFileRoute("/dashboard/placement/resume")({
  component: PlacementResume,
});
