export interface Nudo {
  id: string;
  date: string;
  title: string;
  emotion: string;
  summary: string;
  abc: {
    antecedent: string;
    belief: string;
    consequence: string;
  };
  alternativeThought?: string;
  excerpt: string;
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
}

const ABC_PENDING = "Pendiente de análisis automático.";

export function mapDbNudo(row: DbNudoRow): Nudo {
  return {
    id: row.id,
    date: row.date,
    title: row.title,
    emotion: row.emotion ?? "—",
    summary: row.summary ?? "",
    excerpt: row.excerpt ?? "",
    abc: {
      antecedent: row.abc_antecedent ?? ABC_PENDING,
      belief: row.abc_belief ?? ABC_PENDING,
      consequence: row.abc_consequence ?? ABC_PENDING,
    },
    alternativeThought: row.alternative_thought ?? undefined,
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
