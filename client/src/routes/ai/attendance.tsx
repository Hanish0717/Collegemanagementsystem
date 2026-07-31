import { createFileRoute } from "@tanstack/react-router";
import { AiAttendance } from "@/pages/ai/AiAttendance";

export const Route = createFileRoute("/ai/attendance")({
  component: AiAttendance,
});
