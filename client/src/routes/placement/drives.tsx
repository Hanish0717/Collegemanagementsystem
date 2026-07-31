import { createFileRoute } from "@tanstack/react-router";
import { PlacementDrives } from "@/pages/placement/PlacementDrives";

export const Route = createFileRoute("/placement/drives")({
  component: PlacementDrives,
});
