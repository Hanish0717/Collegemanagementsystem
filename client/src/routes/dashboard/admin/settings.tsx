import { createFileRoute } from "@tanstack/react-router";
import { AdminSettings } from '@/modules/admin/pages/AdminSettingsPage';

export const Route = createFileRoute("/dashboard/admin/settings")({
  component: AdminSettings,
});
