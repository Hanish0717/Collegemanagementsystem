import { createFileRoute } from "@tanstack/react-router";
import { InternshipsPage } from "@/pages/admin/alumni/InternshipsPage";

export const Route = createFileRoute("/admin/alumni/internships")({
  component: InternshipsPage,
});
