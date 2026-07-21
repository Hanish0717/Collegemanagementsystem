import { createFileRoute } from "@tanstack/react-router";
import { AdminCommunication } from "@/pages/admin/AdminCommunication";

export const Route = createFileRoute("/dashboard/admin/communication")({
  component: AdminCommunication,
});
