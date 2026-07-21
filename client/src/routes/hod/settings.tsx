import { createFileRoute } from '@tanstack/react-router';
import { HODSettingsPage } from '@/modules/hod/pages/HODSettingsPage';
export const Route = createFileRoute('/hod/settings')({ component: HODSettingsPage });
