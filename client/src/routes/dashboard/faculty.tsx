import { createFileRoute, redirect } from "@tanstack/react-router";
import { FacultyDashboard } from "@/pages/faculty/FacultyDashboard";
import { isAuthenticated } from "@/services/authService";

export const Route = createFileRoute("/dashboard/faculty")({
  beforeLoad: () => {
    if (!isAuthenticated()) {
      throw redirect({ to: "/login" });
    }
  },
  component: FacultyDashboard,
});
