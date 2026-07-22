import { createFileRoute } from "@tanstack/react-router";
import { ParentNotifications } from "@/pages/parent/ParentNotifications";

export const Route = createFileRoute("/dashboard/parent/notifications")({
  component: ParentNotifications,
});
