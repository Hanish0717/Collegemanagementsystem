import { DashboardLayout } from "@/layouts/DashboardLayout";
import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { getStoredUser } from "@/services/authService";
import { normalizeRole, resolveDashboardRoute } from "@/lib/roleResolver";

export const Route = createFileRoute("/admin")({
  beforeLoad: ({ location }) => {
    const user = getStoredUser();
    const activeRole = typeof window !== "undefined" ? localStorage.getItem("campusly.role") : null;
    const effectiveRole = normalizeRole(user?.role) || normalizeRole(activeRole);
    
    // Allow access to shared LMS and Grievance routes
    const isLms = location.pathname.includes("/admin/lms");
    const isGrievance = location.pathname.includes("/admin/grievance");
    
    if (isLms && effectiveRole) {
      return;
    }
    
    if (isGrievance && effectiveRole) {
      return;
    }

    const isAdminAlumni = location.pathname.includes("/admin/alumni") || location.pathname.includes("/alumni");
    if (effectiveRole === "alumni" && !isAdminAlumni) {
      throw redirect({ to: "/alumni/dashboard" as any });
    }

    const allowedRoles = [
      "admin",
      "super_admin",
      "principal",
      "dean",
      "hod",
      "exam_cell",
      "accounts",
      "alumni_coordinator",
      "alumni",
      "transport",
      "warden",
      "librarian",
      "placement"
    ];

    if (!effectiveRole || !allowedRoles.includes(effectiveRole)) {
      const target = effectiveRole ? resolveDashboardRoute(effectiveRole) : "/login";
      throw redirect({ to: target as any });
    }
  },
  component: DashboardLayout,
});
