import { createFileRoute } from "@tanstack/react-router";
import { StudentWebinars } from "@/pages/student/StudentWebinars";

export const Route = createFileRoute("/dashboard/student/webinars")({
  component: StudentWebinars,
});
