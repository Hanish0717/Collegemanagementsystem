import { createFileRoute } from "@tanstack/react-router";
import { AiSettings } from "@/pages/ai/AiSettings";

export const Route = createFileRoute("/dashboard/ai/settings")({
  component: AiSettings,
});
