import { createFileRoute } from "@tanstack/react-router";
import { StudentWebinars } from "@/pages/student/StudentWebinars";

export const Route = createFileRoute("/student/webinars")({
  component: StudentWebinars,
});
