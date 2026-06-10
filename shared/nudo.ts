export type NudoStatus = "draft" | "complete";

export interface Nudo {
  id: string;
  date: string;
  title: string;
  emotion: string;
  summary: string;
  status?: NudoStatus;
  abc: {
    antecedent: string;
    belief: string;
    consequence: string;
  };
  alternativeThought?: string;
  excerpt: string;
  chatSessionId?: string;
  distressScale?: number;
  distressInitial?: number;
  distressFinal?: number;
  beliefLiteral?: string;
  physiologicalSymptoms?: string[];
  behavioralPatterns?: string[];
}

export interface DbNudoRow {
  id: string;
  user_id: string;
  chat_session_id: string | null;
  date: string;
  title: string;
  emotion: string | null;
  summary: string | null;
  excerpt: string | null;
  abc_antecedent: string | null;
  abc_belief: string | null;
  abc_consequence: string | null;
  alternative_thought: string | null;
  created_at: string;
  distress_scale: number | null;
  distress_initial: number | null;
  distress_final: number | null;
  belief_literal: string | null;
  physiological_symptoms: string[] | null;
  behavioral_patterns: string[] | null;
  status: NudoStatus;
}

export const ABC_PENDING = "Pendiente de análisis automático.";

export function isAbcPending(nudo: Nudo): boolean {
  return (
    nudo.abc.antecedent === ABC_PENDING ||
    nudo.abc.belief === ABC_PENDING ||
    nudo.abc.consequence === ABC_PENDING
  );
}

export function mapDbNudo(row: DbNudoRow): Nudo {
  return {
    id: row.id,
    date: row.date,
    title: row.title,
    emotion: row.emotion ?? "—",
    summary: row.summary ?? "",
    excerpt: row.excerpt ?? "",
    chatSessionId: row.chat_session_id ?? undefined,
    abc: {
      antecedent: row.abc_antecedent ?? ABC_PENDING,
      belief: row.abc_belief ?? ABC_PENDING,
      consequence: row.abc_consequence ?? ABC_PENDING,
    },
    alternativeThought: row.alternative_thought ?? undefined,
    distressScale: row.distress_scale ?? undefined,
    distressInitial: row.distress_initial ?? undefined,
    distressFinal: row.distress_final ?? undefined,
    beliefLiteral: row.belief_literal ?? undefined,
    physiologicalSymptoms: row.physiological_symptoms ?? undefined,
    behavioralPatterns: row.behavioral_patterns ?? undefined,
    status: row.status ?? "complete",
  };
}

export type NudoFilter = "7d" | "30d" | "all";
export type ExportPeriod = "7d" | "30d";

export function filterNudos(nudos: Nudo[], filter: NudoFilter | ExportPeriod): Nudo[] {
  if (filter === "all") return nudos;

  const now = new Date();
  const days = filter === "7d" ? 7 : 30;
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - days);

  return nudos.filter((n) => new Date(n.date) >= cutoff);
}
