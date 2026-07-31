import { createFileRoute } from '@tanstack/react-router';
import Residents from '@/pages/hostel/mess/Residents';

export const Route = createFileRoute('/hostel/mess/residents')({
  component: Residents,
});
