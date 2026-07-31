import { createFileRoute } from "@tanstack/react-router";
import { ParentReports } from "@/pages/parent/ParentReports";

export const Route = createFileRoute("/parent/reports")({
  component: ParentReports,
});
