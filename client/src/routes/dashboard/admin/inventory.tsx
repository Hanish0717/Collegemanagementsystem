import { createFileRoute } from "@tanstack/react-router";
import { AdminInventory } from "@/pages/admin/AdminInventory";

export const Route = createFileRoute("/dashboard/admin/inventory")({
  component: AdminInventory,
});
