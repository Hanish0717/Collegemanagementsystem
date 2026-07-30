import { createFileRoute } from "@tanstack/react-router";
import { AdminTimetable } from '@/modules/admin/pages/AdminTimetablePage';

export const Route = createFileRoute("/dashboard/admin/timetable")({
  component: AdminTimetable,
});
