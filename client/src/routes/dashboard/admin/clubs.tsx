import { createFileRoute } from "@tanstack/react-router";
import { AdminClubs } from '@/modules/admin/pages/AdminClubsPage';

export const Route = createFileRoute("/dashboard/admin/clubs")({
  component: AdminClubs,
});
