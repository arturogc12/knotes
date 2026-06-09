import type { ExportPeriod } from "../../shared/nudo";
import { supabase } from "./supabase";

export type { ExportPeriod } from "../../shared/nudo";

export async function downloadNudosPdf(period: ExportPeriod): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("No hay sesión activa. Inicia sesión de nuevo.");
  }

  const res = await fetch("/api/export", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ period }),
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error ?? "No se pudo generar el informe PDF.");
  }

  const blob = await res.blob();
  const today = new Date().toISOString().slice(0, 10);
  const filename = `k-notes-informe-${period}-${today}.pdf`;

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
