import { createFileRoute } from '@tanstack/react-router';
import Residents from '@/pages/dashboard/hostel/mess/Residents';

export const Route = createFileRoute('/dashboard/hostel/mess/residents')({
  component: Residents,
});
