import { createFileRoute } from "@tanstack/react-router";
import { ParentMarks } from "@/pages/parent/ParentMarks";

export const Route = createFileRoute("/dashboard/parent/marks")({
  component: ParentMarks,
});
