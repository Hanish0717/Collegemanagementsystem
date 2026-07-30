import { createFileRoute } from "@tanstack/react-router";
import { PlacementDrives } from "@/pages/placement/PlacementDrives";
import { PlacementErrorBoundary } from "@/components/placement/PlacementErrorBoundary";

export const Route = createFileRoute("/dashboard/placement/drives")({
  component: () => (
    <PlacementErrorBoundary pageName="Placement Drives">
      <PlacementDrives />
    </PlacementErrorBoundary>
  ),
});
