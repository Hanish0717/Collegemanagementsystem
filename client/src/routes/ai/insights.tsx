import { createFileRoute } from "@tanstack/react-router";
import { AiInsights } from "@/pages/ai/AiInsights";

export const Route = createFileRoute("/ai/insights")({
  component: AiInsights,
});
