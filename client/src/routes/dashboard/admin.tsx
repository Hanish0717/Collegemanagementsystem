import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { getStoredUser } from "@/services/authService";

export const Route = createFileRoute("/dashboard/admin")({
  beforeLoad: ({ location }) => {
    const user = getStoredUser();
    
    // Allow access to shared LMS and Grievance routes
    const isLms = location.pathname.includes("/dashboard/admin/lms");
    const isGrievance = location.pathname.includes("/dashboard/admin/grievance");
    
    if (isLms) {
      const allowedLms = ["student", "faculty", "lms", "admin", "super-admin", "principal", "dean", "hod", "exam-cell", "accounts"];
      if (user && allowedLms.includes(user.role)) return;
    }
    
    if (isGrievance) {
      const allowedGrievance = ["student", "parent", "faculty", "admin", "super-admin", "principal", "dean", "hod", "exam-cell", "accounts"];
      if (user && allowedGrievance.includes(user.role)) return;
    }

    const isAdminAlumni = location.pathname.includes("/dashboard/admin/alumni") || location.pathname.includes("/alumni");
    if (user && (user.role === "alumni" || user.role === "alumni-coordinator") && !isAdminAlumni) {
      throw redirect({ to: "/alumni/dashboard" });
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
      "alumni",
      "transport",
      "transport-manager"
    ];
    if (!user || !allowedRoles.includes(user.role)) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: Outlet,
});
