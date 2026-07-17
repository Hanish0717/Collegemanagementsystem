import { createFileRoute } from '@tanstack/react-router';
import { ProfilePage } from '@/pages/admin/alumni/ProfilePage';

export const Route = createFileRoute('/dashboard/admin/alumni/profile')({
  component: ProfilePage,
});
