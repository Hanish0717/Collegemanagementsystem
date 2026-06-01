import { createFileRoute } from "@tanstack/react-router";
import { AdminExams } from "@/pages/admin/AdminExams";

export const Route = createFileRoute("/dashboard/admin/exams")({
  component: AdminExams,
});
