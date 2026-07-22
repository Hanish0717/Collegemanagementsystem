import { createFileRoute } from "@tanstack/react-router";
import { LibrarianSettings } from "@/pages/library/LibrarianSettings";

export const Route = createFileRoute("/dashboard/librarian/settings")({
  component: LibrarianSettings,
});
