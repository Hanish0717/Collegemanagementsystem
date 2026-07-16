import { createFileRoute } from "@tanstack/react-router";
import { PlacementsPage } from "@/pages/admin/alumni/PlacementsPage";

export const Route = createFileRoute("/dashboard/admin/alumni/placement")({
  component: PlacementsPage,
});
