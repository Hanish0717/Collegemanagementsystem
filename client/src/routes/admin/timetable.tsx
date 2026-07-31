import { createFileRoute } from "@tanstack/react-router";
import { AdminTimetable } from "@/pages/admin/AdminTimetable";

export const Route = createFileRoute("/admin/timetable")({
  component: AdminTimetable,
});
