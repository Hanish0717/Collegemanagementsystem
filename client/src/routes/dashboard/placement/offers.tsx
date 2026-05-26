import { createFileRoute } from "@tanstack/react-router";
import { PlacementOffers } from "@/pages/placement/PlacementOffers";

export const Route = createFileRoute("/dashboard/placement/offers")({
  component: PlacementOffers,
});
