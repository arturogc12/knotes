import type { Request, Response } from "express";
import { generateChatReply } from "./openai.js";
import type { ChatRequestBody, ChatResponseBody, ChatState } from "./types.js";
import { INITIAL_STATE } from "./types.js";

function advanceState(
  state: ChatState,
  situationUnderstood: boolean,
  enoughContext: boolean,
): ChatState {
  const next = { ...state };

  switch (next.phase) {
    case "welcome":
      next.phase = "venting";
      break;

    case "venting":
      next.ventCount++;
      if (enoughContext || next.ventCount >= 3) {
        next.phase = "exploration";
      }
      break;

    case "exploration":
      next.explorationTurns++;
      if (situationUnderstood) {
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
        next.phase = "closing";
      }
      break;

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
        reply: "Esta conversación ya ha terminado. Cuando lo necesites, puedes volver a empezar.",
        state,
      };
      return res.json(response);
    }

    // Bienvenida automática (sin mensaje del usuario).
    if (!userMessage && state.phase === "welcome" && history.length === 0) {
      const { reply } = await generateChatReply([], "welcome", state);
      const nextState = advanceState(state, false, false);
      const response: ChatResponseBody = { reply, state: nextState };
      return res.json(response);
    }

    // Cierre experto automático (Fase 5, sin mensaje del usuario).
    if (!userMessage && state.phase === "closing") {
      const { reply } = await generateChatReply(history, "closing", state);
      const nextState = advanceState(state, false, false);
      const response: ChatResponseBody = { reply, state: nextState };
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

    const { reply, situationUnderstood, enoughContext } = await generateChatReply(
      updatedHistory,
      state.phase,
      state,
    );

    const nextState = advanceState(state, situationUnderstood, enoughContext);
    const response: ChatResponseBody = { reply, state: nextState };
    return res.json(response);
  } catch (error) {
    console.error("[chat]", error);
    const message =
      error instanceof Error ? error.message : "Error interno del servidor";
    return res.status(500).json({ error: message });
  }
}
