import { createFileRoute, redirect } from "@tanstack/react-router";
import { DashboardIndex } from "@/pages/dashboard/DashboardIndex";
import { getStoredUser, getDashboardForRole } from "@/services/authService";

export const Route = createFileRoute("/dashboard/")({
  beforeLoad: () => {
    const user = getStoredUser();
    if (user) {
      const targetDashboard = getDashboardForRole(user.role);
      if (targetDashboard !== "/dashboard" && targetDashboard !== "/dashboard/") {
        throw redirect({ to: targetDashboard });
      }
    }
  },
  component: DashboardIndex,
});
