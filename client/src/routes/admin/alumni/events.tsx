import { createFileRoute } from "@tanstack/react-router";
import { EventsPage } from "@/pages/admin/alumni/EventsPage";

export const Route = createFileRoute("/admin/alumni/events")({
  component: EventsPage,
});
