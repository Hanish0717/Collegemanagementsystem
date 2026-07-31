import { createFileRoute } from "@tanstack/react-router";
import { FacultyMaterials } from "@/pages/faculty/FacultyMaterials";

export const Route = createFileRoute("/faculty/materials")({
  component: FacultyMaterials,
});
