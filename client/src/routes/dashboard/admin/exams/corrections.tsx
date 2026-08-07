import { createFileRoute } from "@tanstack/react-router";
import { ExamCorrections } from '@/pages/admin/exams/ExamCorrections';

export const Route = createFileRoute("/dashboard/admin/exams/corrections")({
  component: ExamCorrections,
});
