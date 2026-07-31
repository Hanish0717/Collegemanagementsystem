import { createFileRoute } from "@tanstack/react-router";
import { FacultyPerformance } from "@/pages/faculty/FacultyPerformance";

export const Route = createFileRoute("/faculty/performance")({
  component: FacultyPerformance,
});
