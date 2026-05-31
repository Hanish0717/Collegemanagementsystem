import { createFileRoute } from '@tanstack/react-router';
import Fees from '@/pages/dashboard/hostel/mess/Fees';

export const Route = createFileRoute('/dashboard/hostel/mess/fees')({
  component: Fees,
});
