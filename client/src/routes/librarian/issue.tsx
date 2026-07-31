import { createFileRoute } from "@tanstack/react-router";
import { LibrarianIssueBooks } from "@/pages/library/LibrarianIssueBooks";

export const Route = createFileRoute("/librarian/issue")({
  component: LibrarianIssueBooks,
});
