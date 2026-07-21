import { createFileRoute } from '@tanstack/react-router';
import { HODNotFoundPage } from '@/modules/hod/pages/HODNotFoundPage';

export const Route = createFileRoute('/hod/404')({
  component: HODNotFoundPage,
});
