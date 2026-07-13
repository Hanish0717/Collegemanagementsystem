import { createFileRoute, redirect } from "@tanstack/react-router";
import { FacultyDashboard } from "@/pages/faculty/FacultyDashboard";
import { getStoredUser } from "@/services/authService";

export const Route = createFileRoute("/dashboard/faculty")({
  beforeLoad: () => {
    const user = getStoredUser();
    if (!user || user.role !== "faculty") {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: FacultyDashboard,
});
