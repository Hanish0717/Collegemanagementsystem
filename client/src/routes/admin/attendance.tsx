import { createFileRoute } from "@tanstack/react-router";
import { AdminAttendance } from "@/pages/admin/AdminAttendance";

export const Route = createFileRoute("/admin/attendance")({
  component: AdminAttendance,
});
