import { createFileRoute } from "@tanstack/react-router";
import { StudentHallTicket } from "@/pages/student/StudentHallTicket";

export const Route = createFileRoute("/student/hall-ticket")({
  component: StudentHallTicket,
});
