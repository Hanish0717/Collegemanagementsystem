import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { getStoredUser } from "@/services/authService";

export const Route = createFileRoute("/dashboard/admin")({
  beforeLoad: () => {
    const user = getStoredUser();
    if (!user || user.role !== "admin") {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: AdminDashboard,
});
