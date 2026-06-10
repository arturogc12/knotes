import PDFDocument from "pdfkit";
import type { Request, Response } from "express";
import type { ExportPeriod } from "../shared/nudo.js";
import { buildClinicalReportData, type ClinicalReportData } from "./reportData.js";
import { getUserIdFromRequest } from "./supabaseAdmin.js";

interface ExportRequestBody {
  period?: ExportPeriod;
}

const PERIOD_LABELS: Record<ExportPeriod, string> = {
  "7d": "Última semana",
  "30d": "Último mes",
};

const ACCENT = "#7EB8DA";
const TEXT = "#2A3540";
const MUTED = "#5A7080";
const BORDER = "#C8DAE8";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 50;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function truncate(text: string, maxLen: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLen) return trimmed;
  return `${trimmed.slice(0, maxLen - 1)}…`;
}

function drawSectionTitle(doc: PDFKit.PDFDocument, title: string) {
  doc.fontSize(11).fillColor(ACCENT).text(title);
  doc.moveDown(0.25);
}

function drawLabelValue(doc: PDFKit.PDFDocument, label: string, value: string) {
  doc.fontSize(9).fillColor(MUTED).text(label, { continued: true });
  doc.fillColor(TEXT).text(` ${value}`);
}

function drawClusterList(
  doc: PDFKit.PDFDocument,
  items: { label: string; frequency: number }[],
  emptyMessage: string,
) {
  if (items.length === 0) {
    doc.fontSize(9).fillColor(MUTED).text(emptyMessage);
    return;
  }
  for (const item of items) {
    doc
      .fontSize(9)
      .fillColor(TEXT)
      .text(`• ${item.label} (${item.frequency})`, { width: CONTENT_WIDTH });
  }
}

function drawBulletList(doc: PDFKit.PDFDocument, items: string[], emptyMessage: string) {
  if (items.length === 0) {
    doc.fontSize(9).fillColor(MUTED).text(emptyMessage);
    return;
  }
  for (const item of items) {
    doc.fontSize(9).fillColor(TEXT).text(`• ${item}`, { width: CONTENT_WIDTH });
  }
}

function drawPageOne(doc: PDFKit.PDFDocument, data: ClinicalReportData, period: ExportPeriod) {
  const { metadata, metrics, clusters } = data;

  doc
    .fontSize(20)
    .fillColor(ACCENT)
    .text("K-Notes", { align: "center" })
    .moveDown(0.2);

  doc
    .fontSize(14)
    .fillColor(TEXT)
    .text("Reporte Clínico Semanal", { align: "center" })
    .moveDown(0.3);

  doc
    .fontSize(9)
    .fillColor(MUTED)
    .text(`Periodo: ${PERIOD_LABELS[period]}`, { align: "center" })
    .moveDown(1);

  drawSectionTitle(doc, "1. Metadatos de control clínico");
  drawLabelValue(doc, "ID Paciente:", metadata.patientId);
  drawLabelValue(doc, "Rango de fechas:", `${metadata.dateRangeStart} — ${metadata.dateRangeEnd}`);
  drawLabelValue(doc, "Sesión de referencia:", String(metadata.sessionReference));
  drawLabelValue(doc, "Generado:", metadata.generatedAt);
  doc.moveDown(0.6);

  drawSectionTitle(doc, "2. Indicadores cuantitativos de actividad");
  drawLabelValue(doc, "Volumen semanal:", String(metrics.weeklyVolume));
  drawLabelValue(
    doc,
    "Malestar promedio:",
    metrics.averageDistress != null ? metrics.averageDistress.toFixed(1) : "—",
  );
  drawLabelValue(
    doc,
    "Pico máximo:",
    metrics.peakDistress != null
      ? `${metrics.peakDistress.toFixed(1)} (${metrics.peakDistressDay ?? "—"})`
      : "—",
  );
  doc.moveDown(0.6);

  drawSectionTitle(doc, "3. Matriz de agrupación funcional (clúster semántico TCC)");

  doc.fontSize(10).fillColor(ACCENT).text("Clúster A — Antecedentes");
  doc.moveDown(0.15);
  drawClusterList(doc, clusters.antecedents, "Sin antecedentes registrados.");
  doc.moveDown(0.35);

  doc.fontSize(10).fillColor(ACCENT).text("Clúster B — Cogniciones");
  doc.moveDown(0.15);
  drawClusterList(doc, clusters.cognitions, "Sin cogniciones indexadas.");
  doc.moveDown(0.35);

  doc.fontSize(10).fillColor(ACCENT).text("Clúster C — Consecuencias");
  doc.moveDown(0.15);
  doc.fontSize(9).fillColor(MUTED).text("Manifestaciones fisiológicas:");
  doc.moveDown(0.1);
  drawBulletList(doc, clusters.physiological, "Ninguna reportada.");
  doc.moveDown(0.2);
  doc.fontSize(9).fillColor(MUTED).text("Patrones conductuales:");
  doc.moveDown(0.1);
  drawBulletList(doc, clusters.behavioral, "Ninguno reportado.");
}

function drawTableHeader(doc: PDFKit.PDFDocument, y: number, colWidths: number[]) {
  const headers = [
    "Fecha/Hora",
    "A — Antecedente",
    "B — Pensamiento",
    "Emoción / Fisiología",
    "C — Conducta",
  ];
  let x = MARGIN;

  doc.fontSize(7).fillColor(ACCENT);
  for (let i = 0; i < headers.length; i++) {
    doc.text(headers[i], x + 2, y + 4, { width: colWidths[i] - 4, lineBreak: false });
    x += colWidths[i];
  }

  doc
    .strokeColor(BORDER)
    .lineWidth(0.5)
    .moveTo(MARGIN, y + 16)
    .lineTo(PAGE_WIDTH - MARGIN, y + 16)
    .stroke();
}

function drawTableRow(
  doc: PDFKit.PDFDocument,
  row: ClinicalReportData["tableRows"][number],
  y: number,
  rowHeight: number,
  colWidths: number[],
) {
  const cells = [
    row.datetime,
    truncate(row.antecedent, 80),
    `"${truncate(row.beliefLiteral, 70)}"`,
    truncate(row.emotionalResponse, 60),
    truncate(row.conduct, 80),
  ];

  let x = MARGIN;
  doc.fontSize(7).fillColor(TEXT);

  for (let i = 0; i < cells.length; i++) {
    doc.text(cells[i], x + 2, y + 3, {
      width: colWidths[i] - 4,
      height: rowHeight - 4,
      ellipsis: true,
    });
    x += colWidths[i];
  }

  doc
    .strokeColor(BORDER)
    .lineWidth(0.3)
    .moveTo(MARGIN, y + rowHeight)
    .lineTo(PAGE_WIDTH - MARGIN, y + rowHeight)
    .stroke();
}

function drawPageTwo(doc: PDFKit.PDFDocument, data: ClinicalReportData) {
  doc.addPage();

  doc
    .fontSize(12)
    .fillColor(ACCENT)
    .text("4. Registro de evidencias en crudo — Matriz TCC")
    .moveDown(0.5);

  const colWidths = [62, 118, 118, 98, 99];
  const headerY = doc.y;
  drawTableHeader(doc, headerY, colWidths);

  const availableHeight = PAGE_HEIGHT - MARGIN - headerY - 40;
  const maxRows = Math.min(data.tableRows.length, 12);
  const rowHeight = Math.min(48, Math.floor(availableHeight / Math.max(maxRows, 1)));

  let rowY = headerY + 18;
  for (let i = 0; i < maxRows; i++) {
    drawTableRow(doc, data.tableRows[i], rowY, rowHeight, colWidths);
    rowY += rowHeight;
  }

  if (data.tableRows.length > maxRows) {
    doc
      .fontSize(7)
      .fillColor(MUTED)
      .text(
        `… ${data.tableRows.length - maxRows} registro(s) adicional(es) omitido(s) por límite de página.`,
        MARGIN,
        rowY + 4,
        { width: CONTENT_WIDTH },
      );
  }

  doc
    .fontSize(7)
    .fillColor(MUTED)
    .text(
      "Documento confidencial generado por K-Notes. Destinado exclusivamente al uso terapéutico entre paciente y profesional de la salud mental.",
      MARGIN,
      PAGE_HEIGHT - MARGIN - 20,
      { width: CONTENT_WIDTH, align: "center" },
    );
}

function generatePdfBuffer(data: ClinicalReportData, period: ExportPeriod): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: MARGIN, size: "A4" });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    drawPageOne(doc, data, period);
    drawPageTwo(doc, data);

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
    const reportData = await buildClinicalReportData(userId, period);

    if (reportData.metrics.weeklyVolume === 0) {
      return res.status(400).json({ error: "No hay nudos en este periodo para exportar." });
    }

    const pdfBuffer = await generatePdfBuffer(reportData, period);
    const today = new Date().toISOString().slice(0, 10);
    const filename = `k-notes-reporte-${period}-${today}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error("Error generando PDF:", err);
    return res.status(500).json({ error: "Error al generar el informe PDF." });
  }
}
