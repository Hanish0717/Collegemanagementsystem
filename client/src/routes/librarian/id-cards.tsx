import { createFileRoute } from '@tanstack/react-router';
import { LibrarianIdCards } from '@/pages/library/LibrarianIdCards';

export const Route = createFileRoute('/librarian/id-cards')({
  component: LibrarianIdCards,
});
