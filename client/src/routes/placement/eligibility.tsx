import { createFileRoute } from "@tanstack/react-router";
import { PlacementEligibility } from "@/pages/placement/PlacementEligibility";

export const Route = createFileRoute("/placement/eligibility")({
  component: PlacementEligibility,
});
