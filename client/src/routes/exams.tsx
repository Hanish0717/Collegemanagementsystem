import { DashboardLayout } from "@/layouts/DashboardLayout";
import { createFileRoute } from "@tanstack/react-router";
import { ExamsPage } from "@/pages/dashboard/ExamsPage";

export const Route = createFileRoute("/exams")({
  component: ExamsPage,
});
