import { createFileRoute } from '@tanstack/react-router';
import { AiDashboard } from '@/pages/ai/AiDashboard';

export const Route = createFileRoute('/ai/')({
  component: AiDashboard,
});
