import { createFileRoute } from "@tanstack/react-router";
import { AiChatbot } from "@/pages/ai/AiChatbot";

export const Route = createFileRoute("/ai/chatbot")({
  component: AiChatbot,
});
