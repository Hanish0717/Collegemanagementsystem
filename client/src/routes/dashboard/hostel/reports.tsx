import { createFileRoute } from "@tanstack/react-router";
import { HostelReports } from "@/pages/hostel/HostelReports";

export const Route = createFileRoute("/dashboard/hostel/reports")({
  component: HostelReports,
});
