import { createFileRoute } from "@tanstack/react-router";
import { LibrarianMembers } from "@/pages/library/LibrarianMembers";

export const Route = createFileRoute("/librarian/members")({
  component: LibrarianMembers,
});
