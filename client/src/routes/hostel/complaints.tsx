import { createFileRoute } from "@tanstack/react-router";
import { HostelComplaints } from "@/pages/hostel/HostelComplaints";

export const Route = createFileRoute("/hostel/complaints")({
  component: HostelComplaints,
});
