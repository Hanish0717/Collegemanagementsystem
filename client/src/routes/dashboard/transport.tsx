import { createFileRoute, redirect } from "@tanstack/react-router";
import { TransportDashboard } from "@/pages/transport/TransportDashboard";
import { isAuthenticated } from "@/services/authService";

export const Route = createFileRoute("/dashboard/transport")({
  beforeLoad: () => {
    if (!isAuthenticated()) {
      throw redirect({ to: "/login" });
    }
  },
  component: TransportDashboard,
});
