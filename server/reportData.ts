import { createHash } from "node:crypto";
import {
  isAbcPending,
  mapDbNudo,
  type DbNudoRow,
  type ExportPeriod,
  type Nudo,
} from "../shared/nudo.js";
import { extractAbcFromMessages, updateNudoWithExtraction } from "./extractAbc.js";
import { getOpenAIClient } from "./openai.js";
import { getSupabaseAdmin } from "./supabaseAdmin.js";
import type { ChatMessage } from "./types.js";

export interface ReportMetadata {
  patientId: string;
  dateRangeStart: string;
  dateRangeEnd: string;
  sessionReference: number;
  generatedAt: string;
}

export interface ReportMetrics {
  weeklyVolume: number;
  averageDistress: number | null;
  peakDistress: number | null;
  peakDistressDay: string | null;
}

export interface ClusterItem {
  label: string;
  frequency: number;
}

export interface ReportClusters {
  antecedents: ClusterItem[];
  cognitions: ClusterItem[];
  physiological: string[];
  behavioral: string[];
}

export interface ReportTableRow {
  datetime: string;
  antecedent: string;
  beliefLiteral: string;
  emotionalResponse: string;
  conduct: string;
}

export interface ClinicalReportData {
  metadata: ReportMetadata;
  metrics: ReportMetrics;
  clusters: ReportClusters;
  tableRows: ReportTableRow[];
}

const DAY_NAMES = [
  "domingo",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
];

function periodCutoff(period: ExportPeriod): string {
  const days = period === "7d" ? 7 : 30;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return cutoff.toISOString();
}

function hashPatientId(userId: string): string {
  return createHash("sha256").update(userId).digest("hex").slice(0, 8).toUpperCase();
}

function formatIsoWithTimezone(date: Date): string {
  return date.toLocaleString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

function formatTableDatetime(iso: string): string {
  return new Date(iso).toLocaleString("es-ES", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function dayOfWeek(iso: string): string {
  return DAY_NAMES[new Date(iso).getDay()] ?? "—";
}

async function fetchNudosForUser(userId: string, period: ExportPeriod): Promise<Nudo[]> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("nudos")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "complete")
    .gte("date", periodCutoff(period))
    .order("date", { ascending: true });

  if (error) throw new Error(error.message);
  return (data as DbNudoRow[]).map(mapDbNudo);
}

async function countSessionsUpTo(userId: string, endDate: string): Promise<number> {
  const admin = getSupabaseAdmin();
  const { count, error } = await admin
    .from("nudos")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .lte("date", endDate);

  if (error) throw new Error(error.message);
  return count ?? 0;
}

async function fetchChatMessages(chatSessionId: string): Promise<ChatMessage[] | null> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("chat_sessions")
    .select("messages")
    .eq("id", chatSessionId)
    .maybeSingle();

  if (error || !data?.messages) return null;
  return data.messages as ChatMessage[];
}

async function ensureNudoExtracted(nudo: Nudo, userId: string): Promise<Nudo> {
  if (!isAbcPending(nudo)) return nudo;
  if (!nudo.chatSessionId) return applyFallback(nudo);

  const messages = await fetchChatMessages(nudo.chatSessionId);
  if (!messages?.length) return applyFallback(nudo);

  try {
    const extracted = await extractAbcFromMessages(messages);
    await updateNudoWithExtraction(nudo.id, userId, extracted, {
      initial: nudo.distressInitial,
      final: nudo.distressFinal,
    });
    return {
      ...nudo,
      abc: {
        antecedent: extracted.antecedent,
        belief: extracted.belief,
        consequence: extracted.consequence,
      },
      beliefLiteral: extracted.beliefLiteral,
      emotion: extracted.emotion,
      distressScale: nudo.distressInitial ?? extracted.distressScale,
      physiologicalSymptoms: extracted.physiologicalSymptoms,
      behavioralPatterns: extracted.behavioralPatterns,
      alternativeThought: extracted.alternativeThought,
    };
  } catch {
    return applyFallback(nudo);
  }
}

function applyFallback(nudo: Nudo): Nudo {
  return {
    ...nudo,
    abc: {
      antecedent: nudo.excerpt || nudo.title,
      belief: nudo.beliefLiteral ?? nudo.excerpt ?? nudo.title,
      consequence: nudo.emotion !== "—" ? nudo.emotion : "No registrado",
    },
    beliefLiteral: nudo.beliefLiteral ?? nudo.excerpt ?? nudo.title,
  };
}

function buildMetrics(nudos: Nudo[]): ReportMetrics {
  const scales = nudos
    .map((n) => n.distressScale)
    .filter((s): s is number => typeof s === "number");

  let peakDistress: number | null = null;
  let peakDistressDay: string | null = null;

  for (const nudo of nudos) {
    if (nudo.distressScale == null) continue;
    if (peakDistress == null || nudo.distressScale > peakDistress) {
      peakDistress = nudo.distressScale;
      peakDistressDay = dayOfWeek(nudo.date);
    }
  }

  return {
    weeklyVolume: nudos.length,
    averageDistress:
      scales.length > 0 ? scales.reduce((a, b) => a + b, 0) / scales.length : null,
    peakDistress,
    peakDistressDay,
  };
}

function buildTableRows(nudos: Nudo[]): ReportTableRow[] {
  return nudos.map((nudo) => {
    const physiological = nudo.physiologicalSymptoms?.length
      ? nudo.physiologicalSymptoms.join(", ")
      : null;
    const emotionalParts = [nudo.emotion !== "—" ? nudo.emotion : null];
    if (nudo.distressScale != null) {
      emotionalParts.push(`Intensidad: ${nudo.distressScale}/10`);
    }
    if (physiological) emotionalParts.push(physiological);

    return {
      datetime: formatTableDatetime(nudo.date),
      antecedent: nudo.abc.antecedent,
      beliefLiteral: nudo.beliefLiteral ?? nudo.abc.belief,
      emotionalResponse: emotionalParts.filter(Boolean).join(" · ") || "—",
      conduct: nudo.abc.consequence,
    };
  });
}

const CLUSTER_PROMPT = `Eres un analista clínico TCC. A partir de los registros semanales de un paciente, genera agrupaciones funcionales objetivas.

REGLAS:
- Solo recuentos y descripciones objetivas. Sin consejos, juicios ni lenguaje directivo.
- Agrupa antecedentes por categoría/ámbito similar con frecuencia.
- Agrupa cogniciones por mecanismo o sesgo detectado con recuento exacto.
- Lista manifestaciones fisiológicas únicas reportadas.
- Lista patrones conductuales únicos (seguridad/comprobación o evitación/retirada).

Responde SOLO en JSON:
{
  "antecedents": [{ "label": "string", "frequency": number }],
  "cognitions": [{ "label": "string", "frequency": number }],
  "physiological": ["string"],
  "behavioral": ["string"]
}`;

async function buildClusters(nudos: Nudo[]): Promise<ReportClusters> {
  const payload = nudos.map((n) => ({
    antecedent: n.abc.antecedent,
    belief: n.abc.belief,
    consequence: n.abc.consequence,
    physiological: n.physiologicalSymptoms ?? [],
    behavioral: n.behavioralPatterns ?? [],
    distressScale: n.distressScale,
  }));

  try {
    const openai = getOpenAIClient();
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: CLUSTER_PROMPT },
        { role: "user", content: JSON.stringify(payload, null, 2) },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error("Sin respuesta de clústeres");

    const parsed = JSON.parse(raw) as {
      antecedents?: ClusterItem[];
      cognitions?: ClusterItem[];
      physiological?: string[];
      behavioral?: string[];
    };

    return {
      antecedents: Array.isArray(parsed.antecedents) ? parsed.antecedents : [],
      cognitions: Array.isArray(parsed.cognitions) ? parsed.cognitions : [],
      physiological: Array.isArray(parsed.physiological) ? parsed.physiological : [],
      behavioral: Array.isArray(parsed.behavioral) ? parsed.behavioral : [],
    };
  } catch {
    return buildFallbackClusters(nudos);
  }
}

function buildFallbackClusters(nudos: Nudo[]): ReportClusters {
  const antecedentCounts = new Map<string, number>();
  for (const n of nudos) {
    const key = n.abc.antecedent.slice(0, 60);
    antecedentCounts.set(key, (antecedentCounts.get(key) ?? 0) + 1);
  }

  const physiological = [
    ...new Set(nudos.flatMap((n) => n.physiologicalSymptoms ?? [])),
  ];
  const behavioral = [...new Set(nudos.flatMap((n) => n.behavioralPatterns ?? []))];

  return {
    antecedents: [...antecedentCounts.entries()].map(([label, frequency]) => ({
      label,
      frequency,
    })),
    cognitions: nudos.map((n) => ({ label: n.abc.belief.slice(0, 60), frequency: 1 })),
    physiological,
    behavioral,
  };
}

export async function buildClinicalReportData(
  userId: string,
  period: ExportPeriod,
): Promise<ClinicalReportData> {
  const rawNudos = await fetchNudosForUser(userId, period);
  const nudos = await Promise.all(rawNudos.map((n) => ensureNudoExtracted(n, userId)));

  const dates = nudos.map((n) => new Date(n.date));
  const minDate = dates.length ? new Date(Math.min(...dates.map((d) => d.getTime()))) : new Date();
  const maxDate = dates.length ? new Date(Math.max(...dates.map((d) => d.getTime()))) : new Date();

  const sessionReference = await countSessionsUpTo(userId, maxDate.toISOString());

  const metadata: ReportMetadata = {
    patientId: hashPatientId(userId),
    dateRangeStart: minDate.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    dateRangeEnd: maxDate.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    sessionReference,
    generatedAt: formatIsoWithTimezone(new Date()),
  };

  const metrics = buildMetrics(nudos);
  const clusters = await buildClusters(nudos);
  const tableRows = buildTableRows(nudos);

  return { metadata, metrics, clusters, tableRows };
}
