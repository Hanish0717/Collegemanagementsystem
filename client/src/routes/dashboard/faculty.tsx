import { createFileRoute, redirect } from '@tanstack/react-router';
import { FacultyDashboard } from '@/pages/faculty/FacultyDashboard';
import { getStoredUser } from '@/services/authService';

export const Route = createFileRoute('/dashboard/faculty')({
  beforeLoad: () => {
    const user = getStoredUser();
    const frontendRole =
      typeof window !== 'undefined' ? localStorage.getItem('campusly.role') : null;
    const isFaculty = user?.role === 'faculty';
    const isLms = frontendRole === 'lms';
    if (!user || (!isFaculty && !isLms)) {
      throw redirect({ to: '/dashboard' });
    }
  },
  component: FacultyDashboard,
});
