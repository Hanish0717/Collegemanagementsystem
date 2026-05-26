import { createFileRoute, redirect } from "@tanstack/react-router";
import { Register } from "@/pages/auth/Register";
import { isAuthenticated, getStoredUser, getDashboardForRole } from "@/services/authService";

export const Route = createFileRoute("/register")({
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
