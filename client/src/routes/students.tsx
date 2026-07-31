import { createFileRoute } from "@tanstack/react-router";
import { StudentsPage } from "@/pages/dashboard/StudentsPage";

export const Route = createFileRoute("/students")({
  component: StudentsPage,
});
