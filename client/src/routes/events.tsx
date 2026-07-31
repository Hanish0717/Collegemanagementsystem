import { createFileRoute } from "@tanstack/react-router";
import { EventsPage } from "@/pages/dashboard/EventsPage";

export const Route = createFileRoute("/events")({
  component: EventsPage,
});
