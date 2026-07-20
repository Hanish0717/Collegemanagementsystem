import { createFileRoute } from '@tanstack/react-router';
import { PlacementCompanies } from '@/pages/placement/PlacementCompanies';

export const Route = createFileRoute('/dashboard/placement/companies')({
  component: PlacementCompanies,
});
