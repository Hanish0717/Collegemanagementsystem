import { createFileRoute } from "@tanstack/react-router";
import { FacultyEvaluations } from "@/pages/faculty/FacultyEvaluations";

export const Route = createFileRoute("/dashboard/faculty/evaluations")({
  component: FacultyEvaluations,
});
