import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { getDashboardForRole, toFrontendRole } from "@/services/authService";
import { setActiveRole } from "@/lib/roles";

export const Route = createFileRoute("/dashboard/student")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("cms_user");
      let userRole = "";
      let rawRole = "";

      if (stored) {
        try {
          const user = JSON.parse(stored);
          rawRole = user.role || "";
          userRole = toFrontendRole(rawRole);
        } catch (e) {
          console.error("Error parsing stored user in student beforeLoad:", e);
        }
      }

      if (userRole && userRole !== "student") {
        const target = getDashboardForRole(rawRole || userRole);
        setActiveRole(userRole as any);
        localStorage.setItem("campusly.role", userRole);
        throw redirect({ to: target as any });
      }

      if (stored && (userRole === "student" || !userRole)) {
        setActiveRole("student");
        localStorage.setItem("campusly.role", "student");
      }
    }
  },
  component: () => <Outlet />,
});

