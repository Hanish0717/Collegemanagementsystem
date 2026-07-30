import { createFileRoute } from "@tanstack/react-router";
import { PlacementCalendar } from "@/pages/placement/PlacementCalendar";

export const Route = createFileRoute("/dashboard/placement/calendar")({
  component: PlacementCalendar,
});
