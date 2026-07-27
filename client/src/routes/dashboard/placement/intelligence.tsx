import { createFileRoute } from "@tanstack/react-router";
import { PlacementIntelligence } from "@/pages/placement/PlacementIntelligence";

export const Route = createFileRoute("/dashboard/placement/intelligence")({
  component: PlacementIntelligence,
});
