import { createFileRoute, redirect } from "@tanstack/react-router";
import { ResetPassword } from "@/pages/auth/ResetPassword";
import { isAuthenticated, getStoredUser, getDashboardForRole } from "@/services/authService";

export const Route = createFileRoute("/reset-password")({
  beforeLoad: () => {
    if (isAuthenticated()) {
      const user = getStoredUser();
      if (user) {
        throw redirect({ to: getDashboardForRole(user.role) });
      }
    }
  },
  component: ResetPassword,
});
