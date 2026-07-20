import { createFileRoute } from '@tanstack/react-router';
import { LibrarianNotifications } from '@/pages/library/LibrarianNotifications';

export const Route = createFileRoute('/dashboard/librarian/notifications')({
  component: LibrarianNotifications,
});
