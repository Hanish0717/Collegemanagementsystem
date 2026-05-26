import { createFileRoute } from "@tanstack/react-router";
import { LibrarianMembers } from "@/pages/library/LibrarianMembers";

export const Route = createFileRoute("/dashboard/librarian/members")({
  component: LibrarianMembers,
});
