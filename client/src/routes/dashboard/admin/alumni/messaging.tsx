import { createFileRoute } from "@tanstack/react-router";
import { MessagingPage } from '@/pages/admin/alumni/MessagingPage';

export const Route = createFileRoute("/dashboard/admin/alumni/messaging")({
  component: MessagingPage,
});
