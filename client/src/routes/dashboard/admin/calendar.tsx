import { createFileRoute } from "@tanstack/react-router";
import { AdminCalendar } from '@/modules/admin/pages/AdminCalendarPage';

export const Route = createFileRoute("/dashboard/admin/calendar")({
  component: AdminCalendar,
});
