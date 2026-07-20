import { createFileRoute } from '@tanstack/react-router';
import { SettingsPage } from '@/pages/admin/alumni/SettingsPage';

export const Route = createFileRoute('/dashboard/admin/alumni/settings')({
  component: SettingsPage,
});
