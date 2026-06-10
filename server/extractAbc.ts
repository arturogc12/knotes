import type { Request, Response } from "express";
import { getOpenAIClient } from "./openai.js";
import { getSupabaseAdmin, getUserIdFromRequest } from "./supabaseAdmin.js";
import type { ChatMessage } from "./types.js";

export interface ExtractedAbc {
  antecedent: string;
  belief: string;
  beliefLiteral: string;
  consequence: string;
  emotion: string;
  distressScale: number;
  physiologicalSymptoms: string[];
  behavioralPatterns: string[];
  alternativeThought?: string;
}

const EXTRACTION_PROMPT = `Eres un analista clínico TCC. A partir de la transcripción de una conversación terapéutica, extrae datos estructurados del episodio central.

REGLAS ESTRICTAS:
- Solo usa información explícita del diálogo. No interpretes, no diagnostiques, no des consejos.
- El antecedente (A) debe ser una descripción objetiva del evento detonante.
- beliefLiteral debe ser la autoverbalización EXACTA del usuario (copia literal de sus palabras sobre su pensamiento automático). Si no hay cita clara, usa la frase más cercana del usuario entrecomillada.
- belief es una síntesis objetiva del pensamiento/conducta (B), sin juicios.
- consequence (C) describe emociones y resultados reportados por el usuario.
- distressScale: estima la intensidad de malestar/ansiedad del usuario en escala 1-10 según lo expresado (1=mínimo, 10=máximo). Si no hay datos, usa 5.
- physiologicalSymptoms: lista de sintomatología corporal explícitamente reportada (ej. "taquicardia", "nudo en el estómago").
- behavioralPatterns: lista de conductas objetivas (seguridad/comprobación o evitación/retirada) que el usuario mencionó haber hecho.
- alternativeThought: pensamiento alternativo que el usuario formuló, si existe.

Responde SOLO en JSON con este formato:
{
  "antecedent": "string",
  "belief": "string",
  "beliefLiteral": "string",
  "consequence": "string",
  "emotion": "string",
  "distressScale": number,
  "physiologicalSymptoms": ["string"],
  "behavioralPatterns": ["string"],
  "alternativeThought": "string o null"
}`;

function formatConversation(messages: ChatMessage[]): string {
  return messages
    .map((m) => `${m.role === "user" ? "Paciente" : "Terapeuta"}: ${m.content}`)
    .join("\n\n");
}

function clampDistress(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return 5;
  return Math.min(10, Math.max(1, Math.round(n)));
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

export async function extractAbcFromMessages(messages: ChatMessage[]): Promise<ExtractedAbc> {
  const openai = getOpenAIClient();
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const completion = await openai.chat.completions.create({
    model,
    messages: [
      { role: "system", content: EXTRACTION_PROMPT },
      { role: "user", content: formatConversation(messages) },
    ],
    temperature: 0.2,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("OpenAI no devolvió contenido en extracción A-B-C");

  const parsed = JSON.parse(raw) as Partial<ExtractedAbc & { alternativeThought: string | null }>;

  const antecedent = typeof parsed.antecedent === "string" ? parsed.antecedent.trim() : "";
  const belief = typeof parsed.belief === "string" ? parsed.belief.trim() : "";
  const beliefLiteral = typeof parsed.beliefLiteral === "string" ? parsed.beliefLiteral.trim() : "";
  const consequence = typeof parsed.consequence === "string" ? parsed.consequence.trim() : "";
  const emotion = typeof parsed.emotion === "string" ? parsed.emotion.trim() : "—";

  if (!antecedent || !belief || !consequence) {
    throw new Error("Extracción A-B-C incompleta");
  }

  return {
    antecedent,
    belief,
    beliefLiteral: beliefLiteral || belief,
    consequence,
    emotion,
    distressScale: clampDistress(parsed.distressScale),
    physiologicalSymptoms: asStringArray(parsed.physiologicalSymptoms),
    behavioralPatterns: asStringArray(parsed.behavioralPatterns),
    alternativeThought:
      typeof parsed.alternativeThought === "string" && parsed.alternativeThought.trim()
        ? parsed.alternativeThought.trim()
        : undefined,
  };
}

export interface UserDistress {
  initial?: number;
  final?: number;
}

export async function updateNudoWithExtraction(
  nudoId: string,
  userId: string,
  extracted: ExtractedAbc,
  userDistress?: UserDistress,
): Promise<void> {
  // La intensidad dada por el usuario en el chat prevalece sobre la estimación del LLM.
  const distressInitial = userDistress?.initial ? clampDistress(userDistress.initial) : null;
  const distressFinal = userDistress?.final ? clampDistress(userDistress.final) : null;

  const admin = getSupabaseAdmin();
  const { error } = await admin
    .from("nudos")
    .update({
      abc_antecedent: extracted.antecedent,
      abc_belief: extracted.belief,
      abc_consequence: extracted.consequence,
      belief_literal: extracted.beliefLiteral,
      emotion: extracted.emotion,
      distress_scale: distressInitial ?? extracted.distressScale,
      ...(distressInitial !== null ? { distress_initial: distressInitial } : {}),
      ...(distressFinal !== null ? { distress_final: distressFinal } : {}),
      physiological_symptoms: extracted.physiologicalSymptoms,
      behavioral_patterns: extracted.behavioralPatterns,
      alternative_thought: extracted.alternativeThought ?? null,
    })
    .eq("id", nudoId)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
}

interface ExtractAbcRequestBody {
  nudoId?: string;
  messages?: ChatMessage[];
  distressInitial?: number;
  distressFinal?: number;
}

export async function handleExtractAbc(req: Request, res: Response) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const userId = await getUserIdFromRequest(req.headers.authorization);
  if (!userId) {
    return res.status(401).json({ error: "No autorizado. Inicia sesión de nuevo." });
  }

  const { nudoId, messages, distressInitial, distressFinal } =
    req.body as ExtractAbcRequestBody;

  if (!nudoId || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Se requieren nudoId y messages." });
  }

  try {
    const extracted = await extractAbcFromMessages(messages);
    await updateNudoWithExtraction(nudoId, userId, extracted, {
      initial: typeof distressInitial === "number" ? distressInitial : undefined,
      final: typeof distressFinal === "number" ? distressFinal : undefined,
    });
    return res.json({ ok: true });
  } catch (err) {
    console.error("Error extrayendo A-B-C:", err);
    return res.status(500).json({ error: "Error al extraer el análisis A-B-C." });
  }
}
