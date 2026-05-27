import { createFileRoute, redirect } from "@tanstack/react-router";
import { Register } from "@/pages/auth/Register";
import { isAuthenticated, getStoredUser, getDashboardForRole } from "@/services/authService";

export const Route = createFileRoute("/register")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      role: search.role as string | undefined,
    }
  },
  beforeLoad: () => {
    if (isAuthenticated()) {
      const user = getStoredUser();
      if (user) {
        throw redirect({ to: getDashboardForRole(user.role) });
      }
    }
  },
  component: Register,
});
