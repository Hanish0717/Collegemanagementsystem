import { createFileRoute } from '@tanstack/react-router';
import { HODNotificationsPage } from '@/modules/hod/pages/HODNotificationsPage';
export const Route = createFileRoute('/hod/notifications')({ component: HODNotificationsPage });
