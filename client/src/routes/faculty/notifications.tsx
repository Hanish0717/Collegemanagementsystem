import { createFileRoute } from '@tanstack/react-router';
import { FacultyNotifications } from '@/pages/faculty/FacultyNotifications';

export const Route = createFileRoute('/faculty/notifications')({
  component: FacultyNotifications,
});
