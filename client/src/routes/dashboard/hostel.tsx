import { createFileRoute, redirect } from "@tanstack/react-router";
import { HostelDashboard } from "@/pages/hostel/HostelDashboard";
import { isAuthenticated } from "@/services/authService";

export const Route = createFileRoute("/dashboard/hostel")({
  beforeLoad: () => {
    if (!isAuthenticated()) {
      throw redirect({ to: "/login" });
    }
  },
  component: HostelDashboard,
});
