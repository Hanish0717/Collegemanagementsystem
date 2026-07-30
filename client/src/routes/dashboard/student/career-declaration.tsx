import { createFileRoute } from "@tanstack/react-router";
import { StudentCareerDeclaration } from "@/pages/student/StudentCareerDeclaration";

export const Route = createFileRoute("/dashboard/student/career-declaration")({
  component: StudentCareerDeclaration,
});
