import { createFileRoute } from "@tanstack/react-router";
import { LibrarianReturn } from "@/pages/library/LibrarianReturn";

export const Route = createFileRoute("/librarian/return")({
  component: LibrarianReturn,
});
