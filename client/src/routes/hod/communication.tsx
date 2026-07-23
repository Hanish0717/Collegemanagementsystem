import { createFileRoute, redirect } from '@tanstack/react-router';
import { HODAnnouncementsPage } from '@/modules/hod/pages/HODAnnouncementsPage';

export const Route = createFileRoute('/hod/communication')({
  component: HODAnnouncementsPage,
});
