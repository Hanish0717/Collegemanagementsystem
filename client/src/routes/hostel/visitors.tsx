import { createFileRoute } from "@tanstack/react-router";
import { HostelVisitors } from "@/pages/hostel/HostelVisitors";

export const Route = createFileRoute("/hostel/visitors")({
  component: HostelVisitors,
});
