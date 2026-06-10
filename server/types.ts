export type ChatPhase =
  | "welcome"
  | "venting"
  | "exploration"
  | "socratic"
  | "clarification"
  | "finalRating"
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
  /** Intensidad 1-10 reportada por el usuario al inicio de la conversación. */
  distressInitial?: number;
  /** Intensidad 1-10 reportada por el usuario al final de la conversación. */
  distressFinal?: number;
  /** true cuando la IA ya ha formulado la pregunta de intensidad final. */
  finalRatingAsked?: boolean;
  /** Respuestas del usuario en la fase de intensidad final sin dar un número. */
  finalRatingAttempts?: number;
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
