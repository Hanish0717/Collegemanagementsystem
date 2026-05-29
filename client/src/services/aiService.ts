import api from "../lib/api";

export interface ChatResponse {
  response: string;
  conversationId: string | null;
}

export async function sendChatMessage(
  message: string,
  conversationId?: string | null,
): Promise<ChatResponse> {
  const { data } = await api.post<{ success: boolean; data: ChatResponse }>("/api/ai/chat", {
    message,
    conversationId,
  });
  return data.data;
}
