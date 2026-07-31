import { createFileRoute } from "@tanstack/react-router";
import { LibrarianBooks } from "@/pages/library/LibrarianBooks";

export const Route = createFileRoute("/librarian/books")({
  component: LibrarianBooks,
});
