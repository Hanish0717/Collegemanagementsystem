import { createFileRoute } from "@tanstack/react-router";
import { PlacementCompanies } from "@/pages/placement/PlacementCompanies";

export const Route = createFileRoute("/placement/companies")({
  component: PlacementCompanies,
});
