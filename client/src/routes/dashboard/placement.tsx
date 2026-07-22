import { createFileRoute, redirect } from "@tanstack/react-router";
import { PlacementDashboard } from "@/pages/placement/PlacementDashboard";
import { isAuthenticated } from "@/services/authService";

export const Route = createFileRoute("/dashboard/placement")({
  beforeLoad: () => {
    if (!isAuthenticated()) {
      throw redirect({ to: "/login" });
    }
  },
  component: PlacementDashboard,
});
