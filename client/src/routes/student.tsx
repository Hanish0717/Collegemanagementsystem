import { DashboardLayout } from "@/layouts/DashboardLayout";
import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { getStoredUser } from "@/services/authService";
import { normalizeRole, resolveDashboardRoute } from "@/lib/roleResolver";

export const Route = createFileRoute("/student")({
  beforeLoad: () => {
    const user = getStoredUser();
    const activeRole = typeof window !== "undefined" ? localStorage.getItem("campusly.role") : null;
    const effectiveRole = normalizeRole(user?.role) || normalizeRole(activeRole);

    const allowedRoles = ["student", "parent", "super_admin", "admin"];

    if (!effectiveRole) {
      throw redirect({ to: "/login" as any });
    }

    if (!allowedRoles.includes(effectiveRole)) {
      const target = resolveDashboardRoute(effectiveRole);
      throw redirect({ to: target as any });
    }
  },
  component: DashboardLayout,
});
