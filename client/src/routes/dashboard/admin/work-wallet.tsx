import { createFileRoute } from "@tanstack/react-router";
import { AdminWorkWallet } from '@/modules/admin/pages/AdminWorkWalletPage';

export const Route = createFileRoute("/dashboard/admin/work-wallet")({
  component: AdminWorkWallet,
});
