import { createFileRoute } from '@tanstack/react-router';
import { ReceptionistDashboard } from '@/pages/receptionist/ReceptionistDashboard';

export const Route = createFileRoute('/dashboard/receptionist')({
  component: ReceptionistDashboard,
});
