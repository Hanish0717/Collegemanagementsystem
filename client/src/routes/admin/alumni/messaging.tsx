import { createFileRoute } from "@tanstack/react-router";
import { MessagingPage } from "@/pages/admin/alumni/MessagingPage";

export const Route = createFileRoute("/admin/alumni/messaging")({
  component: MessagingPage,
});
