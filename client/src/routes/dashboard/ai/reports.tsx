import { createFileRoute } from '@tanstack/react-router';
import { AiReports } from '@/pages/ai/AiReports';

export const Route = createFileRoute('/dashboard/ai/reports')({
  component: AiReports,
});
