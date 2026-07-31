import { createFileRoute } from "@tanstack/react-router";
import { ParentMarks } from "@/pages/parent/ParentMarks";

export const Route = createFileRoute("/parent/marks")({
  component: ParentMarks,
});
