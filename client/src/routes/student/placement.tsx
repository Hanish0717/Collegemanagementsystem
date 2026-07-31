import { createFileRoute } from "@tanstack/react-router";
import { StudentPlacement } from "@/pages/student/StudentPlacement";

export const Route = createFileRoute("/student/placement")({
  component: StudentPlacement,
});
