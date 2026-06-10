import {
  mapDbNudo,
  type DbNudoRow,
  type ExportPeriod,
  type Nudo,
  type NudoFilter,
} from "../../shared/nudo";
import { supabase } from "./supabase";

function periodCutoff(period: NudoFilter | ExportPeriod): string | null {
  if (period === "all") return null;
  const days = period === "7d" ? 7 : 30;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return cutoff.toISOString();
}

export async function fetchNudos(filter: NudoFilter): Promise<Nudo[]> {
  let query = supabase.from("nudos").select("*").order("date", { ascending: false });

  const cutoff = periodCutoff(filter);
  if (cutoff) {
    query = query.gte("date", cutoff);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);
  return (data as DbNudoRow[]).map(mapDbNudo);
}

export async function fetchNudoById(id: string): Promise<Nudo | null> {
  const { data, error } = await supabase
    .from("nudos")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return mapDbNudo(data as DbNudoRow);
}

export async function createNudo(input: {
  userId: string;
  chatSessionId: string;
  title: string;
  emotion?: string;
  summary: string;
  excerpt: string;
  distressInitial?: number;
  distressFinal?: number;
}): Promise<string> {
  const { data, error } = await supabase
    .from("nudos")
    .insert({
      user_id: input.userId,
      chat_session_id: input.chatSessionId,
      title: input.title,
      emotion: input.emotion ?? "—",
      summary: input.summary,
      excerpt: input.excerpt,
      distress_initial: input.distressInitial ?? null,
      distress_final: input.distressFinal ?? null,
      distress_scale: input.distressInitial ?? null,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return data.id;
}
