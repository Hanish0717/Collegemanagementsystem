import { createFileRoute } from "@tanstack/react-router";
import { AdminWorkWallet } from "@/pages/admin/AdminWorkWallet";

export const Route = createFileRoute("/dashboard/admin/work-wallet")({
  component: AdminWorkWallet,
});
