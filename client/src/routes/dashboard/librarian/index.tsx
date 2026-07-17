import { createFileRoute } from '@tanstack/react-router';
import { LibrarianDashboard } from '@/pages/library/LibrarianDashboard';

export const Route = createFileRoute('/dashboard/librarian/')({
  component: LibrarianDashboard,
});
