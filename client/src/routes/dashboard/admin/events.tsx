import { createFileRoute } from "@tanstack/react-router";
import { AdminEvents } from "@/pages/admin/AdminEvents";

export const Route = createFileRoute("/dashboard/admin/events")({
  component: AdminEvents,
});
