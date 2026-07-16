import { createFileRoute } from "@tanstack/react-router";
import { ExamAnalytics } from "@/pages/admin/exams/ExamAnalytics";

export const Route = createFileRoute("/dashboard/admin/exams/analytics")({
  component: ExamAnalytics,
});
