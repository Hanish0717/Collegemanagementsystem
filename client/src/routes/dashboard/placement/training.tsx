import { createFileRoute } from "@tanstack/react-router";
import { PlacementTraining } from "@/pages/placement/PlacementTraining";

export const Route = createFileRoute("/dashboard/placement/training")({
  component: PlacementTraining,
});
