export type ChatPhase =
  | "welcome"
  | "venting"
  | "exploration"
  | "socratic"
  | "clarification"
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

export const INITIAL_STATE: ChatState = {
  phase: "welcome",
  ventCount: 0,
  explorationTurns: 0,
  socraticIndex: 0,
  clarificationCount: 0,
};

export interface ChatRequestBody {
  history: ChatMessage[];
  state: ChatState;
  userMessage?: string;
}

export interface ChatResponseBody {
  reply: string;
  state: ChatState;
}
