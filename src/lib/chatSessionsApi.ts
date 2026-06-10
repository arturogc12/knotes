import type { ChatMessage } from "./chatApi";
import { createNudo } from "./nudosApi";
import { requestAbcExtraction } from "./extractAbcApi";
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
  distress?: { initial?: number; final?: number },
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

  const nudoId = await createNudo({
    userId,
    chatSessionId: session.id,
    title: buildTitle(messages),
    summary: closingReply,
    excerpt: buildExcerpt(messages, closingReply),
    distressInitial: distress?.initial,
    distressFinal: distress?.final,
  });

  // Se espera la extracción para que el nudo quede completo (formato tarjeta)
  // antes de confirmar al usuario que está guardado.
  try {
    await requestAbcExtraction(nudoId, messages, distress);
  } catch (err) {
    // El nudo básico ya está guardado; la extracción podrá reintentarse al generar el informe.
    console.error("Extracción A-B-C al cerrar:", err);
  }
}
