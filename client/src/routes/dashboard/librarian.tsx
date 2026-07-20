import { createFileRoute, redirect } from '@tanstack/react-router';
import { LibrarianDashboard } from '@/pages/library/LibrarianDashboard';
import { getStoredUser } from '@/services/authService';

export const Route = createFileRoute('/dashboard/librarian')({
  beforeLoad: () => {
    const user = getStoredUser();
    const allowedRoles = ['librarian', 'admin', 'super-admin', 'principal'];
    if (!user || !allowedRoles.includes(user.role)) {
      throw redirect({ to: '/dashboard' });
    }
  },
  component: LibrarianDashboard,
});
