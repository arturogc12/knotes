export type ChatPhase =
  | "welcome"
  | "venting"
  | "exploration"
  | "socratic"
  | "clarification"
  | "closing"
  | "closed";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatState {
  phase: ChatPhase;
  ventCount: number;
  explorationTurns: number;
  socraticIndex: number;
  clarificationCount: number;
}

export const INITIAL_CHAT_STATE: ChatState = {
  phase: "welcome",
  ventCount: 0,
  explorationTurns: 0,
  socraticIndex: 0,
  clarificationCount: 0,
};

interface ChatApiResponse {
  reply: string;
  state: ChatState;
}

interface ChatApiError {
  error: string;
}

export async function fetchWelcome(): Promise<ChatApiResponse> {
  return postChat({ history: [], state: INITIAL_CHAT_STATE });
}

export async function fetchClosing(
  history: ChatMessage[],
  state: ChatState,
): Promise<ChatApiResponse> {
  return postChat({ history, state });
}

export async function sendChatMessage(
  history: ChatMessage[],
  state: ChatState,
  userMessage: string,
): Promise<ChatApiResponse> {
  return postChat({ history, state, userMessage });
}

async function postChat(body: {
  history: ChatMessage[];
  state: ChatState;
  userMessage?: string;
}): Promise<ChatApiResponse> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = (await res.json()) as ChatApiResponse | ChatApiError;

  if (!res.ok) {
    const err = data as ChatApiError;
    throw new Error(err.error || "Error al conectar con el chat");
  }

  return data as ChatApiResponse;
}
