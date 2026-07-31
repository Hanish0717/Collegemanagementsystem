import { createFileRoute } from "@tanstack/react-router";
import { StudentResults } from "@/pages/student/StudentResults";

export const Route = createFileRoute("/student/results")({
  component: StudentResults,
});
