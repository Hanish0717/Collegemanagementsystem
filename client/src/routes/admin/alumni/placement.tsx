import { createFileRoute } from "@tanstack/react-router";
import { PlacementsPage } from "@/pages/admin/alumni/PlacementsPage";

export const Route = createFileRoute("/admin/alumni/placement")({
  component: PlacementsPage,
});
