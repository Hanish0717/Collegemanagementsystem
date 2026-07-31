import { createFileRoute } from "@tanstack/react-router";
import { AiPerformance } from "@/pages/ai/AiPerformance";

export const Route = createFileRoute("/ai/performance")({
  component: AiPerformance,
});
