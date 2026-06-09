import type { ChatMessage } from "./chatApi";
import { createNudo } from "./nudosApi";
import { supabase } from "./supabase";

function buildTitle(messages: ChatMessage[]): string {
  const firstUser = messages.find((m) => m.role === "user");
  if (!firstUser) {
    return `Conversación del ${new Date().toLocaleDateString("es-ES")}`;
  }
  const text = firstUser.content.trim();
  return text.length > 80 ? `${text.slice(0, 80)}…` : text;
}

function buildExcerpt(messages: ChatMessage[], closingReply: string): string {
  const firstUser = messages.find((m) => m.role === "user");
  const source = firstUser?.content ?? closingReply;
  const text = source.trim();
  return text.length > 120 ? `${text.slice(0, 120)}…` : text;
}

export async function saveClosedChatSession(
  userId: string,
  messages: ChatMessage[],
  closingReply: string,
): Promise<void> {
  const { data: session, error: sessionError } = await supabase
    .from("chat_sessions")
    .insert({
      user_id: userId,
      messages,
      phase: "closed",
      closed_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (sessionError) throw new Error(sessionError.message);

  await createNudo({
    userId,
    chatSessionId: session.id,
    title: buildTitle(messages),
    summary: closingReply,
    excerpt: buildExcerpt(messages, closingReply),
  });
}
