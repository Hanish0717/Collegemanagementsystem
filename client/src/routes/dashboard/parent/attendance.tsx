import { createFileRoute } from "@tanstack/react-router";
import { ParentAttendance } from "@/pages/parent/ParentAttendance";

export const Route = createFileRoute("/dashboard/parent/attendance")({
  component: ParentAttendance,
});
