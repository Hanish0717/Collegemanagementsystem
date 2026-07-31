import { createFileRoute } from "@tanstack/react-router";
import { AttendancePage } from "@/pages/dashboard/AttendancePage";

export const Route = createFileRoute("/attendance")({
  component: AttendancePage,
});
