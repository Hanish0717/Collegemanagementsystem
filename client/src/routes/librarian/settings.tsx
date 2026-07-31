import { createFileRoute } from "@tanstack/react-router";
import { LibrarianSettings } from "@/pages/library/LibrarianSettings";

export const Route = createFileRoute("/librarian/settings")({
  component: LibrarianSettings,
});
