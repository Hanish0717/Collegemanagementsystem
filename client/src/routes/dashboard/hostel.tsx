import { createFileRoute, redirect } from "@tanstack/react-router";
import { HostelDashboard } from "@/pages/hostel/HostelDashboard";
import { getStoredUser } from "@/services/authService";

export const Route = createFileRoute("/dashboard/hostel")({
  beforeLoad: () => {
    const user = getStoredUser();
    if (!user || (user.role !== "hostel-warden" && user.role !== "warden")) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: HostelDashboard,
});
