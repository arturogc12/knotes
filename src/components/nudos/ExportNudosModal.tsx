import { AnimatePresence, motion } from "motion/react";
import { FileDown, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { ExportPeriod } from "../../../shared/nudo";
import { fetchNudos } from "../../lib/nudosApi";
import { downloadNudosPdf } from "../../lib/exportApi";

const EXPORT_PERIODS: { id: ExportPeriod; label: string }[] = [
  { id: "7d", label: "Última semana" },
  { id: "30d", label: "Último mes" },
];

interface ExportNudosModalProps {
  open: boolean;
  onClose: () => void;
}

export function ExportNudosModal({ open, onClose }: ExportNudosModalProps) {
  const [exportPeriod, setExportPeriod] = useState<ExportPeriod>("7d");
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [nudoCount, setNudoCount] = useState(0);
  const [countLoading, setCountLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function loadCount() {
      setCountLoading(true);
      try {
        const nudos = await fetchNudos(exportPeriod);
        if (!cancelled) setNudoCount(nudos.length);
      } catch {
        if (!cancelled) setNudoCount(0);
      } finally {
        if (!cancelled) setCountLoading(false);
      }
    }

    void loadCount();
    return () => {
      cancelled = true;
    };
  }, [open, exportPeriod]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !exporting) onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, exporting, onClose]);

  useEffect(() => {
    if (!open) {
      setExportError(null);
      setExporting(false);
    }
  }, [open]);

  async function handleExport() {
    if (nudoCount === 0) return;

    setExporting(true);
    setExportError(null);

    try {
      await downloadNudosPdf(exportPeriod);
      onClose();
    } catch (err) {
      setExportError(
        err instanceof Error ? err.message : "No se pudo generar el informe PDF.",
      );
    } finally {
      setExporting(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.button
            type="button"
            aria-label="Cerrar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#2A3540]/40 backdrop-blur-sm"
            onClick={() => !exporting && onClose()}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="export-modal-title"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md bg-white/95 border border-[#C8DAE8] rounded-[2rem] p-6 shadow-xl"
          >
            <button
              type="button"
              onClick={onClose}
              disabled={exporting}
              className="absolute top-4 right-4 p-1.5 rounded-full text-[#5A7080] hover:text-[#2A3540] hover:bg-[#F5F9FC] transition-colors disabled:opacity-50"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>

            <h2
              id="export-modal-title"
              className="text-sm font-semibold text-[#2A3540] pr-8"
            >
              Informe clínico para terapeuta
            </h2>
            <p className="mt-1 text-sm text-[#5A7080]">
              Exporta un PDF de 2 páginas con consolidación semanal y matriz TCC en crudo.
            </p>

            <div className="flex flex-wrap gap-2 mt-4">
              {EXPORT_PERIODS.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setExportPeriod(id);
                    setExportError(null);
                  }}
                  disabled={exporting}
                  className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 ${
                    exportPeriod === id
                      ? "bg-[#7EB8DA] text-white shadow-sm"
                      : "bg-white/80 text-[#5A7080] border border-[#C8DAE8] hover:bg-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <p className="mt-3 text-sm text-[#5A7080]">
              {countLoading
                ? "Calculando nudos…"
                : nudoCount === 0
                  ? "No hay nudos en este periodo para exportar."
                  : `${nudoCount} ${nudoCount === 1 ? "nudo incluido" : "nudos incluidos"} en este informe`}
            </p>

            {exportError && (
              <p className="mt-2 text-sm text-red-600">{exportError}</p>
            )}

            <button
              type="button"
              onClick={handleExport}
              disabled={exporting || countLoading || nudoCount === 0}
              className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 rounded-[2rem] text-sm font-semibold text-white bg-[#7EB8DA] hover:bg-[#5A9BC4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileDown className="w-4 h-4" />
              )}
              {exporting ? "Generando PDF…" : "Exportar PDF"}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
