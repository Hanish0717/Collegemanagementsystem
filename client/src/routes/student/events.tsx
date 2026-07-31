import { createFileRoute } from "@tanstack/react-router";
import { StudentEvents } from "@/pages/student/StudentEvents";

export const Route = createFileRoute("/student/events")({
  component: StudentEvents,
});
