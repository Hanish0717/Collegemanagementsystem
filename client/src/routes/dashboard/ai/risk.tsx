import { createFileRoute } from '@tanstack/react-router';
import { AiRisk } from '@/pages/ai/AiRisk';

export const Route = createFileRoute('/dashboard/ai/risk')({
  component: AiRisk,
});
