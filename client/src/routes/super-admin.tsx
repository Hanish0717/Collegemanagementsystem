import { DashboardLayout } from "@/layouts/DashboardLayout";
import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { getStoredUser } from "@/services/authService";
import { normalizeRole, resolveDashboardRoute } from "@/lib/roleResolver";

export const Route = createFileRoute("/super-admin")({
  beforeLoad: () => {
    const user = getStoredUser();
    const activeRole = typeof window !== "undefined" ? localStorage.getItem("campusly.role") : null;
    const effectiveRole = normalizeRole(user?.role) || normalizeRole(activeRole);

    if (!effectiveRole || effectiveRole !== "super_admin") {
      const target = effectiveRole ? resolveDashboardRoute(effectiveRole) : "/login";
      throw redirect({ to: target as any });
    }
  },
  component: DashboardLayout,
});
