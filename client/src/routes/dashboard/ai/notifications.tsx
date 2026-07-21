import { createFileRoute } from "@tanstack/react-router";
import { AiNotifications } from "@/pages/ai/AiNotifications";

export const Route = createFileRoute("/dashboard/ai/notifications")({
  component: AiNotifications,
});
