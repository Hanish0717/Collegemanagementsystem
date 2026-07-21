import { createFileRoute } from "@tanstack/react-router";
import { StudentServices } from "@/pages/student/StudentServices";

export const Route = createFileRoute("/dashboard/student/services")({
  component: StudentServices,
});
