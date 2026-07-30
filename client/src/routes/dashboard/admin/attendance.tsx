import { createFileRoute } from "@tanstack/react-router";
import { AdminAttendance } from '@/modules/admin/pages/AdminAttendancePage';

export const Route = createFileRoute("/dashboard/admin/attendance")({
  component: AdminAttendance,
});
