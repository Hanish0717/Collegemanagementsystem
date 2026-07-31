import { createFileRoute } from '@tanstack/react-router';
import { PlacementDashboard } from '@/pages/placement/PlacementDashboard';

export const Route = createFileRoute('/placement/')({
  component: PlacementDashboard,
});
