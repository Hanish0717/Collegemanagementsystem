import { createFileRoute } from "@tanstack/react-router";
import { HostelSettings } from "@/pages/hostel/HostelSettings";

export const Route = createFileRoute("/hostel/settings")({
  component: HostelSettings,
});
