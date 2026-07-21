import { createFileRoute } from "@tanstack/react-router";
import { HostelFees } from "@/pages/hostel/HostelFees";

export const Route = createFileRoute("/dashboard/hostel/fees")({
  component: HostelFees,
});
