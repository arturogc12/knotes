import { motion } from "motion/react";
import { ChevronRight, FileDown } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ExportNudosModal } from "../components/nudos/ExportNudosModal";
import { formatRelativeDate, type NudoFilter } from "../data/mockNudos";
import { fetchNudos } from "../lib/nudosApi";
import type { Nudo } from "../../shared/nudo";

const FILTERS: { id: NudoFilter; label: string }[] = [
  { id: "7d", label: "Últimos 7 días" },
  { id: "30d", label: "Último mes" },
  { id: "all", label: "Todo" },
];

export default function Nudos() {
  const [filter, setFilter] = useState<NudoFilter>("30d");
  const [exportOpen, setExportOpen] = useState(false);
  const [nudos, setNudos] = useState<Nudo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchNudos(filter);
        if (!cancelled) setNudos(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No se pudieron cargar los nudos.");
          setNudos([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [filter]);

  return (
    <div className="flex flex-col gap-6 py-2 md:py-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-[#2A3540] tracking-tight">
            Mis <span className="font-serif italic text-[#7EB8DA]">Nudos</span>
          </h1>
          <p className="mt-1 text-sm text-[#5A7080]">
            Tus momentos trabajados con K-Notes
          </p>
        </div>

        <button
          type="button"
          onClick={() => setExportOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-[#3D4F5C] border border-[#C8DAE8] bg-white/80 hover:bg-white transition-colors shrink-0 self-start"
        >
          <FileDown className="w-4 h-4 text-[#7EB8DA]" />
          Exportar informe
        </button>
      </div>

      <ExportNudosModal open={exportOpen} onClose={() => setExportOpen(false)} />

      <div className="flex flex-wrap gap-2">
        {FILTERS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              filter === id
                ? "bg-[#7EB8DA] text-white shadow-sm"
                : "bg-white/80 text-[#5A7080] border border-[#C8DAE8] hover:bg-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white/80 border border-[#C8DAE8] rounded-[2rem] p-10 text-center">
          <p className="text-sm text-[#5A7080] animate-pulse">Cargando nudos…</p>
        </div>
      ) : error ? (
        <div className="bg-white/80 border border-[#C8DAE8] rounded-[2rem] p-10 text-center">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      ) : nudos.length === 0 ? (
        <div className="bg-white/80 border border-[#C8DAE8] rounded-[2rem] p-10 text-center">
          <p className="text-sm text-[#5A7080]">
            No hay nudos en este periodo. Cuando cierres una conversación en Conversación,
            aparecerá aquí.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {nudos.map((nudo, idx) => (
            <motion.li
              key={nudo.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Link
                to={`/nudos/${nudo.id}`}
                className="group block bg-white/90 border border-[#C8DAE8] rounded-[1.5rem] p-5 shadow-sm hover:shadow-md hover:border-[#7EB8DA]/30 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#5A7080]">
                        {formatRelativeDate(nudo.date)}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#7EB8DA] bg-[#E3EFF8] px-2 py-0.5 rounded-full">
                        {nudo.emotion}
                      </span>
                    </div>
                    <h2 className="font-semibold text-[#2A3540] group-hover:text-[#7EB8DA] transition-colors">
                      {nudo.title}
                    </h2>
                    <p className="mt-2 text-sm text-[#5A7080] line-clamp-2 leading-relaxed">
                      {nudo.excerpt}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#7EB8DA]/60 shrink-0 mt-1 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
