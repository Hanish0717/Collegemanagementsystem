import { createFileRoute } from "@tanstack/react-router";
import { HostelComplaints } from "@/pages/hostel/HostelComplaints";

export const Route = createFileRoute("/dashboard/hostel/complaints")({
  component: HostelComplaints,
});
