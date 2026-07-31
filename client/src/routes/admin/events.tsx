import { createFileRoute } from "@tanstack/react-router";
import { AdminEvents } from "@/pages/admin/AdminEvents";

export const Route = createFileRoute("/admin/events")({
  component: AdminEvents,
});
