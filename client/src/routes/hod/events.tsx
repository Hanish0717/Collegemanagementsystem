import { createFileRoute } from '@tanstack/react-router';
import { HODEventsPage } from '@/modules/hod/pages/HODEventsPage';

export const Route = createFileRoute('/hod/events')({
  component: HODEventsPage,
});
