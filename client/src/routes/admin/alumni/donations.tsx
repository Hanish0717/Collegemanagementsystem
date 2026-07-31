import { createFileRoute } from "@tanstack/react-router";
import { DonationsPage } from "@/pages/admin/alumni/DonationsPage";

export const Route = createFileRoute("/admin/alumni/donations")({
  component: DonationsPage,
});
