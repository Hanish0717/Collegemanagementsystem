import { createFileRoute } from '@tanstack/react-router';
import { LibrarianIssueBooks } from '@/pages/library/LibrarianIssueBooks';

export const Route = createFileRoute('/dashboard/librarian/issue')({
  component: LibrarianIssueBooks,
});
