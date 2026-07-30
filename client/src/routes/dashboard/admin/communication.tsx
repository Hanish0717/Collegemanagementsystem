import { createFileRoute } from "@tanstack/react-router";
import { AdminCommunication } from '@/modules/admin/pages/AdminCommunicationPage';

export const Route = createFileRoute("/dashboard/admin/communication")({
  component: AdminCommunication,
});
