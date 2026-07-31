import { createFileRoute } from "@tanstack/react-router";
import { LibrarianFines } from "@/pages/library/LibrarianFines";

export const Route = createFileRoute("/librarian/fines")({
  component: LibrarianFines,
});
