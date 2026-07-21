import { createFileRoute } from '@tanstack/react-router';
import { HODResearchPage } from '@/modules/hod/pages/HODResearchPage';

export const Route = createFileRoute('/hod/research')({
  component: HODResearchPage,
});
