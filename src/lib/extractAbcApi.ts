import type { ChatMessage } from "./chatApi";
import { supabase } from "./supabase";

export async function requestAbcExtraction(
  nudoId: string,
  messages: ChatMessage[],
  distress?: { initial?: number; final?: number },
): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("No hay sesión activa para extraer el análisis A-B-C.");
  }

  const res = await fetch("/api/extract-abc", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      nudoId,
      messages,
      distressInitial: distress?.initial,
      distressFinal: distress?.final,
    }),
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error ?? "Error al extraer A-B-C");
  }
}
