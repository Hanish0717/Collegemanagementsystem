import { createFileRoute, redirect } from "@tanstack/react-router";
import { PlacementDashboard } from "@/pages/placement/PlacementDashboard";
import { getStoredUser } from "@/services/authService";

export const Route = createFileRoute("/dashboard/placement")({
  beforeLoad: () => {
    const user = getStoredUser();
    if (!user || user.role !== "placement-officer") {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: PlacementDashboard,
});
