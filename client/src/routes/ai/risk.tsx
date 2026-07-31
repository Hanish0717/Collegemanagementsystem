import { createFileRoute } from "@tanstack/react-router";
import { AiRisk } from "@/pages/ai/AiRisk";

export const Route = createFileRoute("/ai/risk")({
  component: AiRisk,
});
