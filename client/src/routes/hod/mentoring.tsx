import { createFileRoute } from '@tanstack/react-router';
import { HODMentoringPage } from '@/modules/hod/pages/HODMentoringPage';

export const Route = createFileRoute('/hod/mentoring')({
  component: HODMentoringPage,
});
