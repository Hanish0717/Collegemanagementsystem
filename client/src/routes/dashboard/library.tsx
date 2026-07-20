import { createFileRoute, redirect } from '@tanstack/react-router';
import { LibraryDashboard } from '@/pages/library/LibraryDashboard';
import { getStoredUser } from '@/services/authService';

export const Route = createFileRoute('/dashboard/library')({
  beforeLoad: () => {
    const user = getStoredUser();
    const allowedRoles = [
      'student',
      'faculty',
      'librarian',
      'admin',
      'super-admin',
      'principal',
      'dean',
      'hod',
      'exam-cell',
      'accounts',
    ];
    if (!user || !allowedRoles.includes(user.role)) {
      throw redirect({ to: '/dashboard' });
    }
  },
  component: LibraryDashboard,
});
