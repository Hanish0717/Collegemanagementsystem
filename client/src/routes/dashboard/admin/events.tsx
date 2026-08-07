import { createFileRoute } from "@tanstack/react-router";
import { AdminEvents } from '@/modules/admin/pages/AdminEventsPage';

export const Route = createFileRoute("/dashboard/admin/events")({
  component: AdminEvents,
});
