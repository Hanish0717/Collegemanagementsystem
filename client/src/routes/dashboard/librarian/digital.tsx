import { createFileRoute } from "@tanstack/react-router";
import { LibrarianDigital } from "@/pages/library/LibrarianDigital";

export const Route = createFileRoute("/dashboard/librarian/digital")({
  component: LibrarianDigital,
});
