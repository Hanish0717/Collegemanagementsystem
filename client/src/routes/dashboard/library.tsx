import { createFileRoute, redirect } from "@tanstack/react-router";
import { LibraryDashboard } from "@/pages/library/LibraryDashboard";
import { getStoredUser } from "@/services/authService";

export const Route = createFileRoute("/dashboard/library")({
  beforeLoad: () => {
    const user = getStoredUser();
    if (!user || user.role !== "librarian") {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: LibraryDashboard,
});
