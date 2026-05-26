import { createFileRoute } from "@tanstack/react-router";
import { AdminTimetable } from "@/pages/admin/AdminTimetable";

export const Route = createFileRoute("/dashboard/admin/timetable")({
  component: AdminTimetable,
});
