import type { Request, Response } from "express";
import { generateChatReply, type AiReply } from "./openai.js";
import type { ChatRequestBody, ChatResponseBody, ChatState } from "./types.js";
import { INITIAL_STATE } from "./types.js";

const MAX_FINAL_RATING_ATTEMPTS = 2;

function advanceState(state: ChatState, ai: AiReply): ChatState {
  const next = { ...state };

  if (!next.distressInitial && ai.distressInitial) {
    next.distressInitial = ai.distressInitial;
  }

  switch (next.phase) {
    case "welcome":
      next.phase = "venting";
      break;

    case "venting":
      next.ventCount++;
      if (ai.enoughContext || next.ventCount >= 3) {
        next.phase = "exploration";
      }
      break;

    case "exploration":
      next.explorationTurns++;
      if (ai.situationUnderstood) {
        next.phase = "socratic";
        next.socraticIndex = 0;
      }
      break;

    case "socratic":
      next.socraticIndex++;
      if (next.socraticIndex >= 3) {
        next.phase = "clarification";
        next.clarificationCount = 0;
      }
      break;

    case "clarification":
      next.clarificationCount++;
      if (next.clarificationCount >= 3) {
        next.phase = "finalRating";
        next.finalRatingAsked = false;
        next.finalRatingAttempts = 0;
      }
      break;

    case "finalRating": {
      if (!next.distressFinal && ai.distressFinal) {
        next.distressFinal = ai.distressFinal;
      }
      const attempts = (next.finalRatingAttempts ?? 0) + 1;
      next.finalRatingAttempts = attempts;
      if (next.distressFinal || attempts >= MAX_FINAL_RATING_ATTEMPTS) {
        next.phase = "closing";
      }
      break;
    }

    case "closing":
      next.phase = "closed";
      break;

    default:
      break;
  }

  return next;
}

export async function handleChat(req: Request, res: Response) {
  try {
    const body = req.body as ChatRequestBody;
    const history = body.history ?? [];
    const state: ChatState = body.state ?? INITIAL_STATE;
    const userMessage = body.userMessage?.trim();

    if (state.phase === "closed" && userMessage) {
      const response: ChatResponseBody = {
        reply: "Esta conversación ya ha terminado. Tu nudo está guardado en Mis Nudos. Cuando lo necesites, puedes volver a empezar.",
        state,
      };
      return res.json(response);
    }

    // Bienvenida automática (sin mensaje del usuario).
    if (!userMessage && state.phase === "welcome" && history.length === 0) {
      const ai = await generateChatReply([], "welcome", state);
      const nextState = advanceState(state, ai);
      const response: ChatResponseBody = { reply: ai.reply, state: nextState };
      return res.json(response);
    }

    // Pregunta automática de intensidad final (sin mensaje del usuario).
    if (!userMessage && state.phase === "finalRating" && !state.finalRatingAsked) {
      const { reply } = await generateChatReply(history, "finalRating", state);
      const nextState: ChatState = { ...state, finalRatingAsked: true };
      const response: ChatResponseBody = { reply, state: nextState };
      return res.json(response);
    }

    // Cierre experto automático (Fase 5, sin mensaje del usuario).
    if (!userMessage && state.phase === "closing") {
      const ai = await generateChatReply(history, "closing", state);
      const nextState = advanceState(state, ai);
      const response: ChatResponseBody = { reply: ai.reply, state: nextState };
      return res.json(response);
    }

    if (!userMessage) {
      return res.status(400).json({ error: "Falta el mensaje del usuario" });
    }

    if (state.phase === "closing") {
      return res.status(400).json({ error: "La conversación está cerrando" });
    }

    if (state.phase === "closed") {
      return res.status(400).json({ error: "La conversación ya está cerrada" });
    }

    const updatedHistory = [
      ...history,
      { role: "user" as const, content: userMessage },
    ];

    const ai = await generateChatReply(updatedHistory, state.phase, state);

    const nextState = advanceState(state, ai);
    const response: ChatResponseBody = { reply: ai.reply, state: nextState };
    return res.json(response);
  } catch (error) {
    console.error("[chat]", error);
    const message =
      error instanceof Error ? error.message : "Error interno del servidor";
    return res.status(500).json({ error: message });
  }
}
