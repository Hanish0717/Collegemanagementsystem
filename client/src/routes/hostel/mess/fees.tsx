import { createFileRoute } from '@tanstack/react-router';
import Fees from '@/pages/hostel/mess/Fees';

export const Route = createFileRoute('/hostel/mess/fees')({
  component: Fees,
});
