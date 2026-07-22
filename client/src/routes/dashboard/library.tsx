import { createFileRoute, redirect } from "@tanstack/react-router";
import { LibraryDashboard } from "@/pages/library/LibraryDashboard";
import { isAuthenticated } from "@/services/authService";

export const Route = createFileRoute("/dashboard/library")({
  beforeLoad: () => {
    if (!isAuthenticated()) {
      throw redirect({ to: "/login" });
    }
  },
  component: LibraryDashboard,
});
