import { createFileRoute, redirect } from "@tanstack/react-router";
import { PlacementDashboard } from "@/pages/placement/PlacementDashboard";
import { getStoredUser } from "@/services/authService";

export const Route = createFileRoute("/dashboard/placement")({
  beforeLoad: () => {
    const user = getStoredUser();
    if (!user || (user.role !== "placement-officer" && user.role !== "placement")) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: PlacementDashboard,
});
