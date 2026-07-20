import { createFileRoute, redirect } from '@tanstack/react-router';
import { StudentDashboard } from '@/pages/student/StudentDashboard';
import { getStoredUser } from '@/services/authService';

export const Route = createFileRoute('/dashboard/student')({
  beforeLoad: () => {
    const user = getStoredUser();
    if (!user || user.role !== 'student') {
      throw redirect({ to: '/dashboard' });
    }
  },
  component: StudentDashboard,
});
