import { createFileRoute } from "@tanstack/react-router";
import { TransportDashboard } from "@/pages/transport/TransportDashboard";

export const Route = createFileRoute("/dashboard/transport")({
  component: TransportDashboard,
});
