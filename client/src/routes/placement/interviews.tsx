import { createFileRoute } from "@tanstack/react-router";
import { PlacementInterviews } from "@/pages/placement/PlacementInterviews";

export const Route = createFileRoute("/placement/interviews")({
  component: PlacementInterviews,
});
