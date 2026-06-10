import type { ChatMessage, ChatPhase, ChatState } from "./chatApi";
import {
  createDraftNudo,
  createNudo,
  finalizeNudo,
  updateDraftNudo,
} from "./nudosApi";
import { requestAbcExtraction } from "./extractAbcApi";
import { supabase } from "./supabase";

export interface DraftPersistenceIds {
  chatSessionId?: string;
  nudoId?: string;
}

export interface FinalizeResult {
  abcExtractionOk: boolean;
}

function buildTitle(messages: ChatMessage[]): string {
  const firstUser = messages.find((m) => m.role === "user");
  if (!firstUser) {
    return `Conversación del ${new Date().toLocaleDateString("es-ES")}`;
  }
  const text = firstUser.content.trim();
  return text.length > 80 ? `${text.slice(0, 80)}…` : text;
}

type SessionRowStatus = "active" | "closed";

function buildSessionState(
  phase: ChatPhase,
  distress?: { initial?: number; final?: number },
): Pick<ChatState, "phase"> & Partial<Pick<ChatState, "distressInitial" | "distressFinal">> {
  return {
    phase,
    ...(distress?.initial !== undefined ? { distressInitial: distress.initial } : {}),
    ...(distress?.final !== undefined ? { distressFinal: distress.final } : {}),
  };
}

function buildExcerpt(messages: ChatMessage[], closingReply?: string): string {
  const firstUser = messages.find((m) => m.role === "user");
  const source = firstUser?.content ?? closingReply ?? "";
  const text = source.trim();
  return text.length > 120 ? `${text.slice(0, 120)}…` : text;
}

export async function ensureDraftChatSession(
  userId: string,
  existingId: string | undefined,
  messages: ChatMessage[],
  phase: ChatPhase,
  distress?: { initial?: number; final?: number },
): Promise<string> {
  if (existingId) {
    await syncDraftChatSession(existingId, messages, phase, distress);
    return existingId;
  }

  const { data, error } = await supabase
    .from("chat_sessions")
    .insert({
      user_id: userId,
      messages,
      session_state: buildSessionState(phase, distress),
      status: "active" satisfies SessionRowStatus,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return data.id;
}

export async function syncDraftChatSession(
  sessionId: string,
  messages: ChatMessage[],
  phase: ChatPhase,
  distress?: { initial?: number; final?: number },
): Promise<void> {
  const { error } = await supabase
    .from("chat_sessions")
    .update({
      messages,
      session_state: buildSessionState(phase, distress),
      status: "active",
    })
    .eq("id", sessionId);

  if (error) throw new Error(error.message);
}

export async function ensureDraftNudo(
  userId: string,
  existingNudoId: string | undefined,
  chatSessionId: string,
  messages: ChatMessage[],
  distress?: { initial?: number; final?: number },
): Promise<string> {
  const title = buildTitle(messages);
  const excerpt = buildExcerpt(messages);

  if (existingNudoId) {
    await updateDraftNudo(existingNudoId, {
      title,
      excerpt,
      distressInitial: distress?.initial,
      distressFinal: distress?.final,
    });
    return existingNudoId;
  }

  return createDraftNudo({
    userId,
    chatSessionId,
    title,
    excerpt,
    distressInitial: distress?.initial,
    distressFinal: distress?.final,
  });
}

export async function syncDraftNudoFromMessages(
  nudoId: string,
  messages: ChatMessage[],
  distress?: { initial?: number; final?: number },
): Promise<void> {
  await updateDraftNudo(nudoId, {
    title: buildTitle(messages),
    excerpt: buildExcerpt(messages),
    distressInitial: distress?.initial,
    distressFinal: distress?.final,
  });
}

export async function finalizeClosedSession(
  userId: string,
  draft: DraftPersistenceIds,
  messages: ChatMessage[],
  closingReply: string,
  distress?: { initial?: number; final?: number },
): Promise<FinalizeResult> {
  const title = buildTitle(messages);
  const excerpt = buildExcerpt(messages, closingReply);

  let chatSessionId = draft.chatSessionId;

  if (chatSessionId) {
    const { error } = await supabase
      .from("chat_sessions")
      .update({
        messages,
        session_state: buildSessionState("closed", distress),
        status: "closed",
      })
      .eq("id", chatSessionId)
      .eq("user_id", userId);

    if (error) throw new Error(error.message);
  } else {
    const { data: session, error: sessionError } = await supabase
      .from("chat_sessions")
      .insert({
        user_id: userId,
        messages,
        session_state: buildSessionState("closed", distress),
        status: "closed",
      })
      .select("id")
      .single();

    if (sessionError) throw new Error(sessionError.message);
    chatSessionId = session.id;
  }

  let nudoId = draft.nudoId;

  if (nudoId) {
    await finalizeNudo(nudoId, {
      title,
      summary: closingReply,
      excerpt,
      distressInitial: distress?.initial,
      distressFinal: distress?.final,
    });
  } else {
    nudoId = await createNudo({
      userId,
      chatSessionId: chatSessionId!,
      title,
      summary: closingReply,
      excerpt,
      distressInitial: distress?.initial,
      distressFinal: distress?.final,
      status: "complete",
    });
  }

  let abcExtractionOk = false;
  try {
    await requestAbcExtraction(nudoId, messages, distress);
    abcExtractionOk = true;
  } catch (err) {
    console.error("Extracción A-B-C al cerrar:", err);
  }

  return { abcExtractionOk };
}

/** @deprecated Usar finalizeClosedSession con borradores incrementales. */
export async function saveClosedChatSession(
  userId: string,
  messages: ChatMessage[],
  closingReply: string,
  distress?: { initial?: number; final?: number },
): Promise<void> {
  await finalizeClosedSession(userId, {}, messages, closingReply, distress);
}
