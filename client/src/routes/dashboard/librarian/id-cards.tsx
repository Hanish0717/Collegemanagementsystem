import { createFileRoute } from '@tanstack/react-router';
import { LibrarianIdCards } from '@/pages/library/LibrarianIdCards';

export const Route = createFileRoute('/dashboard/librarian/id-cards')({
  component: LibrarianIdCards,
});
