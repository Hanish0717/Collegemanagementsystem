import { createFileRoute, redirect } from '@tanstack/react-router';
import { Login } from '@/pages/auth/Login';
import { isAuthenticated, getStoredUser, getDashboardForRole } from '@/services/authService';

export const Route = createFileRoute('/login')({
  beforeLoad: () => {
    if (isAuthenticated()) {
      const user = getStoredUser();
      if (user) {
        throw redirect({ to: getDashboardForRole(user.role) });
      }
    }
  },
  component: Login,
});
