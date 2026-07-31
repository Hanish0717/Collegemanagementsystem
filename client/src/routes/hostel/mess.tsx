import { createFileRoute } from "@tanstack/react-router";
import { HostelMess } from "@/pages/hostel/HostelMess";

export const Route = createFileRoute("/hostel/mess")({
  component: HostelMess,
});
