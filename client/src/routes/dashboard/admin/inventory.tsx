import { createFileRoute } from "@tanstack/react-router";
import { AdminInventory } from '@/modules/admin/pages/AdminInventoryPage';

export const Route = createFileRoute("/dashboard/admin/inventory")({
  component: AdminInventory,
});
