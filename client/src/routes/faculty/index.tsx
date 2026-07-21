import { createFileRoute } from '@tanstack/react-router';
import { FacultyDashboard } from '@/pages/faculty/FacultyDashboard';

export const Route = createFileRoute('/faculty/')({
  component: FacultyDashboard,
});
