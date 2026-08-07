import { createFileRoute } from "@tanstack/react-router";
import { ExamHallTickets } from '@/pages/admin/exams/ExamHallTickets';

export const Route = createFileRoute("/dashboard/admin/exams/hall-tickets")({
  component: ExamHallTickets,
});
