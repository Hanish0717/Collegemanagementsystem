import { createFileRoute } from '@tanstack/react-router';
import { ParentFees } from '@/pages/parent/ParentFees';

export const Route = createFileRoute('/dashboard/parent/fees')({
  component: ParentFees,
});
