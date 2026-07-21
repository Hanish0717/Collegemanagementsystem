import { createFileRoute, redirect } from "@tanstack/react-router";
import { TransportDashboard } from "@/pages/transport/TransportDashboard";
import { getStoredUser } from "@/services/authService";

export const Route = createFileRoute("/dashboard/transport")({
  beforeLoad: () => {
    const user = getStoredUser();
    if (!user || (user.role !== "transport-manager" && user.role !== "transport")) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: TransportDashboard,
});
