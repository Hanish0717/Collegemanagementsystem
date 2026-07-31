import { createFileRoute } from "@tanstack/react-router";
import { LibrarianNotifications } from "@/pages/library/LibrarianNotifications";

export const Route = createFileRoute("/librarian/notifications")({
  component: LibrarianNotifications,
});
