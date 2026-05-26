import { createFileRoute } from "@tanstack/react-router";
import { PlacementDrives } from "@/pages/placement/PlacementDrives";

export const Route = createFileRoute("/dashboard/placement/drives")({
  component: PlacementDrives,
});
