import { createFileRoute } from "@tanstack/react-router";
import { StudentMaterials } from "@/pages/student/StudentMaterials";

export const Route = createFileRoute("/dashboard/student/materials")({
  component: StudentMaterials,
});
