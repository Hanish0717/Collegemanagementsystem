import { createFileRoute, redirect } from '@tanstack/react-router';
import { ForgotPassword } from '@/pages/auth/ForgotPassword';
import { isAuthenticated, getStoredUser, getDashboardForRole } from '@/services/authService';

export const Route = createFileRoute('/forgot-password')({
  beforeLoad: () => {
    if (isAuthenticated()) {
      const user = getStoredUser();
      if (user) {
        throw redirect({ to: getDashboardForRole(user.role) });
      }
    }
  },
  component: ForgotPassword,
});
