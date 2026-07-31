import { createFileRoute } from '@tanstack/react-router';
import { HostelDashboard } from '@/pages/hostel/HostelDashboard';

export const Route = createFileRoute('/hostel/')({
  component: HostelDashboard,
});
