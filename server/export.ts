import PDFDocument from "pdfkit";
import type { Request, Response } from "express";
import {
  mapDbNudo,
  type DbNudoRow,
  type ExportPeriod,
  type Nudo,
} from "../shared/nudo.js";
import { getSupabaseAdmin, getUserIdFromRequest } from "./supabaseAdmin.js";

interface ExportRequestBody {
  period?: ExportPeriod;
}

const PERIOD_LABELS: Record<ExportPeriod, string> = {
  "7d": "Última semana",
  "30d": "Último mes",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function periodCutoff(period: ExportPeriod): string {
  const days = period === "7d" ? 7 : 30;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return cutoff.toISOString();
}

async function fetchNudosForUser(userId: string, period: ExportPeriod): Promise<Nudo[]> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("nudos")
    .select("*")
    .eq("user_id", userId)
    .gte("date", periodCutoff(period))
    .order("date", { ascending: true });

  if (error) throw new Error(error.message);
  return (data as DbNudoRow[]).map(mapDbNudo);
}

function generatePdfBuffer(period: ExportPeriod, nudos: Nudo[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const accent = "#C17B5C";
    const text = "#2D2D2D";
    const muted = "#5D6D66";
    const generatedAt = new Date().toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    doc
      .fontSize(22)
      .fillColor(accent)
      .text("K-Notes", { align: "center" })
      .moveDown(0.3);

    doc
      .fontSize(16)
      .fillColor(text)
      .text("Informe clínico A-B-C", { align: "center" })
      .moveDown(0.5);

    doc
      .fontSize(11)
      .fillColor(muted)
      .text(`Periodo: ${PERIOD_LABELS[period]}`, { align: "center" })
      .text(`Generado el ${generatedAt}`, { align: "center" })
      .text(`${nudos.length} ${nudos.length === 1 ? "nudo incluido" : "nudos incluidos"}`, {
        align: "center",
      })
      .moveDown(1.5);

    nudos.forEach((nudo, index) => {
      if (index > 0) {
        doc.moveDown(0.5);
        doc
          .strokeColor("#E8D8CC")
          .lineWidth(1)
          .moveTo(50, doc.y)
          .lineTo(545, doc.y)
          .stroke();
        doc.moveDown(1);
      }

      doc
        .fontSize(13)
        .fillColor(accent)
        .text(`Nudo ${index + 1}: ${nudo.title}`)
        .moveDown(0.3);

      doc
        .fontSize(10)
        .fillColor(muted)
        .text(`${formatDate(nudo.date)} · ${nudo.emotion}`)
        .moveDown(0.5);

      doc.fontSize(11).fillColor(accent).text("Resumen de la conversación");
      doc.moveDown(0.2);
      doc.fontSize(10).fillColor(text).text(nudo.summary, { align: "justify" });
      doc.moveDown(0.6);

      doc.fontSize(11).fillColor(accent).text("Análisis funcional A-B-C");
      doc.moveDown(0.3);

      doc.fontSize(10).fillColor(accent).text("A — Antecedente");
      doc.fontSize(10).fillColor(text).text(nudo.abc.antecedent, { align: "justify" });
      doc.moveDown(0.4);

      doc.fontSize(10).fillColor(accent).text("B — Conducta / Pensamiento");
      doc.fontSize(10).fillColor(text).text(nudo.abc.belief, { align: "justify" });
      doc.moveDown(0.4);

      doc.fontSize(10).fillColor(accent).text("C — Consecuencia");
      doc.fontSize(10).fillColor(text).text(nudo.abc.consequence, { align: "justify" });

      if (nudo.alternativeThought) {
        doc.moveDown(0.5);
        doc.fontSize(10).fillColor(accent).text("Pensamiento alternativo");
        doc.fontSize(10).fillColor(text).text(nudo.alternativeThought, { align: "justify" });
      }

      if (doc.y > 700) doc.addPage();
    });

    doc.moveDown(2);
    doc
      .fontSize(8)
      .fillColor(muted)
      .text(
        "Documento confidencial generado por K-Notes. Destinado exclusivamente al uso terapéutico entre paciente y profesional de la salud mental.",
        { align: "center" },
      );

    doc.end();
  });
}

export async function handleExport(req: Request, res: Response) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const userId = await getUserIdFromRequest(req.headers.authorization);
  if (!userId) {
    return res.status(401).json({ error: "No autorizado. Inicia sesión de nuevo." });
  }

  const { period } = req.body as ExportRequestBody;

  if (period !== "7d" && period !== "30d") {
    return res.status(400).json({ error: "Periodo inválido. Usa 7d o 30d." });
  }

  try {
    const nudos = await fetchNudosForUser(userId, period);

    if (nudos.length === 0) {
      return res.status(400).json({ error: "No hay nudos en este periodo para exportar." });
    }

    const pdfBuffer = await generatePdfBuffer(period, nudos);
    const today = new Date().toISOString().slice(0, 10);
    const filename = `k-notes-informe-${period}-${today}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error("Error generando PDF:", err);
    return res.status(500).json({ error: "Error al generar el informe PDF." });
  }
}
