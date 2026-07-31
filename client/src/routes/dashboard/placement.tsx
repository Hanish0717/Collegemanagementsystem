import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { isAuthenticated, getDashboardForRole, toFrontendRole } from "@/services/authService";
import { setActiveRole } from "@/lib/roles";

export const Route = createFileRoute("/dashboard/placement")({
  beforeLoad: () => {
    if (!isAuthenticated()) {
      throw redirect({ to: "/login" });
    }
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("cms_user");
      let rawRole = "";
      let userRole = "";

      if (stored) {
        try {
          const user = JSON.parse(stored);
          rawRole = (user.role || "").toLowerCase().trim();
          userRole = toFrontendRole(user.role || "");
        } catch (e) {
          console.error("Error parsing user in placement beforeLoad:", e);
        }

        const allowedPlacementRoles = [
          "placement",
          "placement_officer",
          "placement-officer",
          "admin",
          "super_admin",
          "super-admin",
          "superadmin"
        ];
        if (userRole && !allowedPlacementRoles.includes(userRole) && !allowedPlacementRoles.includes(rawRole)) {
          const target = getDashboardForRole(rawRole || userRole);
          throw redirect({ to: target as any });
        }
      }
      setActiveRole("placement");
      localStorage.setItem("campusly.role", "placement");
    }
  },
  component: () => <Outlet />,
});


