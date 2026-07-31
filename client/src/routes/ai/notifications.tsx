import { createFileRoute } from "@tanstack/react-router";
import { AiNotifications } from "@/pages/ai/AiNotifications";

export const Route = createFileRoute("/ai/notifications")({
  component: AiNotifications,
});
