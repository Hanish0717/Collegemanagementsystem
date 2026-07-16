import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { getStoredUser } from "@/services/authService";

export const Route = createFileRoute("/dashboard/admin")({
  beforeLoad: () => {
    const user = getStoredUser();
    if (user && (user.role === "alumni" || user.role === "alumni-coordinator")) {
      throw redirect({ to: "/dashboard/admin/alumni" });
    }
    const allowedRoles = [
      "admin",
      "super-admin",
      "principal",
      "dean",
      "hod",
      "exam-cell",
      "accounts",
      "alumni-coordinator",
      "alumni"
    ];
    if (!user || !allowedRoles.includes(user.role)) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: AdminDashboard,
});
