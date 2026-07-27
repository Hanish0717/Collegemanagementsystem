import { createFileRoute } from "@tanstack/react-router";
import { PlacementStudentDossier } from "@/pages/placement/PlacementStudentDossier";

export const Route = createFileRoute("/dashboard/placement/history")({
  component: PlacementStudentDossier,
});
