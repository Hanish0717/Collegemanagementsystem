import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { getStoredUser } from "@/services/authService";

export const Route = createFileRoute("/dashboard/admin")({
  beforeLoad: () => {
    const user = getStoredUser();
    const allowedRoles = [
      "admin",
      "super-admin",
      "principal",
      "dean",
      "hod",
      "exam-cell",
      "accounts"
    ];
    if (!user || !allowedRoles.includes(user.role)) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: AdminDashboard,
});
