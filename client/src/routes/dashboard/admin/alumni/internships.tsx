import { createFileRoute } from "@tanstack/react-router";
import { InternshipsPage } from '@/pages/admin/alumni/InternshipsPage';

export const Route = createFileRoute("/dashboard/admin/alumni/internships")({
  component: InternshipsPage,
});
