import { createFileRoute } from '@tanstack/react-router';
import { HODAnnouncementsPage } from '@/modules/hod/pages/HODAnnouncementsPage';

export const Route = createFileRoute('/hod/announcements')({
  component: HODAnnouncementsPage,
});
