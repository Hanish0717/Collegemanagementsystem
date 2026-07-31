import { createFileRoute } from "@tanstack/react-router";
import { LibrarianReports } from "@/pages/library/LibrarianReports";

export const Route = createFileRoute("/librarian/reports")({
  component: LibrarianReports,
});
