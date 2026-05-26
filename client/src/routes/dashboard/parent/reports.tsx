import { createFileRoute } from "@tanstack/react-router";
import { ParentReports } from "@/pages/parent/ParentReports";

export const Route = createFileRoute("/dashboard/parent/reports")({
  component: ParentReports,
});
