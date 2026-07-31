import { createFileRoute } from "@tanstack/react-router";
import { PlacementRecruiters } from "@/pages/placement/PlacementRecruiters";

export const Route = createFileRoute("/dashboard/placement/recruiters")({
  component: PlacementRecruiters,
});
