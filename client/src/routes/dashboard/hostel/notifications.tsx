import { createFileRoute } from '@tanstack/react-router';
import { HostelNotifications } from '@/pages/hostel/HostelNotifications';

export const Route = createFileRoute('/dashboard/hostel/notifications')({
  component: HostelNotifications,
});
