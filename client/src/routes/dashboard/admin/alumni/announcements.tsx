import { createFileRoute } from '@tanstack/react-router';
import { AnnouncementsPage } from '@/pages/admin/alumni/AnnouncementsPage';

export const Route = createFileRoute('/dashboard/admin/alumni/announcements')({
  component: AnnouncementsPage,
});
