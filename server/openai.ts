import OpenAI from "openai";
import { buildSystemPrompt } from "./prompt.js";
import type { ChatMessage, ChatPhase, ChatState } from "./types.js";

let client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY no está configurada (añádela en .env.local o en las variables de entorno del despliegue)",
      );
    }
    client = new OpenAI({ apiKey });
  }
  return client;
}

export interface AiReply {
  reply: string;
  situationUnderstood: boolean;
  enoughContext: boolean;
  distressInitial: number | null;
  distressFinal: number | null;
}

function parseDistress(value: unknown): number | null {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.min(10, Math.max(1, Math.round(n)));
}

export async function generateChatReply(
  history: ChatMessage[],
  phase: ChatPhase,
  state: ChatState,
): Promise<AiReply> {
  const openai = getOpenAIClient();
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: buildSystemPrompt(phase, state) },
    ...history.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];

  const completion = await openai.chat.completions.create({
    model,
    messages,
    temperature: 0.7,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) {
    throw new Error("OpenAI no devolvió contenido");
  }

  const parsed = JSON.parse(raw) as Partial<AiReply>;
  const reply = typeof parsed.reply === "string" ? parsed.reply.trim() : "";
  if (!reply) {
    throw new Error("La respuesta de OpenAI no incluye un mensaje válido");
  }

  return {
    reply,
    situationUnderstood: Boolean(parsed.situationUnderstood),
    enoughContext: Boolean(parsed.enoughContext),
    distressInitial: parseDistress(parsed.distressInitial),
    distressFinal: parseDistress(parsed.distressFinal),
  };
}
