import { createFileRoute } from "@tanstack/react-router";
import { FacultyMarks } from "@/pages/faculty/FacultyMarks";

export const Route = createFileRoute("/faculty/marks")({
  component: FacultyMarks,
});
