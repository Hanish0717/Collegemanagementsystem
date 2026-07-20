import { createFileRoute } from '@tanstack/react-router';
import { Landing } from '@/pages/dashboard/Landing';

export const Route = createFileRoute('/')({
  component: Landing,
});
