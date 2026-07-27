import { createFileRoute } from "@tanstack/react-router";
import { PlacementNotifications } from "@/pages/placement/PlacementNotifications";

export const Route = createFileRoute("/dashboard/placement/notifications")({
  component: PlacementNotifications,
});
