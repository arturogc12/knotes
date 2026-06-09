import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { formatRelativeDate } from "../data/mockNudos";
import { fetchNudoById } from "../lib/nudosApi";
import type { Nudo } from "../../shared/nudo";

export default function NudoDetail() {
  const { id } = useParams<{ id: string }>();
  const [nudo, setNudo] = useState<Nudo | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const data = await fetchNudoById(id!);
        if (cancelled) return;
        if (!data) {
          setNotFound(true);
          setNudo(null);
        } else {
          setNudo(data);
          setNotFound(false);
        }
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-sm text-[#5D6D66] animate-pulse">Cargando nudo…</p>
      </div>
    );
  }

  if (notFound || !nudo) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-[#5D6D66]">No encontramos este nudo.</p>
        <Link
          to="/nudos"
          className="text-sm font-semibold text-[#C17B5C] hover:underline"
        >
          Volver a Mis Nudos
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6 py-2 md:py-4"
    >
      <Link
        to="/nudos"
        className="inline-flex items-center gap-2 text-sm text-[#5D6D66] hover:text-[#2D2D2D] transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        Mis Nudos
      </Link>

      <div>
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#5D6D66]">
            {formatRelativeDate(nudo.date)}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#C17B5C] bg-[#F2E8DE] px-2 py-0.5 rounded-full">
            {nudo.emotion}
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-semibold text-[#2D2D2D] tracking-tight">
          {nudo.title}
        </h1>
      </div>

      <div className="bg-white/90 border border-[#E8D8CC] rounded-[2rem] p-6 shadow-sm">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#C17B5C] mb-3">
          Resumen de la conversación
        </h2>
        <p className="text-sm text-[#4A4A4A] leading-relaxed">{nudo.summary}</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#C17B5C] px-1">
          Análisis funcional A-B-C
        </h2>

        <div className="p-5 bg-[#F7F5F2] rounded-[1.5rem] border border-[#E8D8CC]/60">
          <span className="text-[10px] font-bold tracking-widest text-[#C17B5C] uppercase mb-2 block">
            A — Antecedente
          </span>
          <p className="text-sm text-[#4A4A4A] leading-relaxed">{nudo.abc.antecedent}</p>
        </div>

        <div className="p-5 bg-[#F7F5F2] rounded-[1.5rem] border border-[#E8D8CC]/60">
          <span className="text-[10px] font-bold tracking-widest text-[#C17B5C] uppercase mb-2 block">
            B — Conducta / Pensamiento
          </span>
          <p className="text-sm text-[#4A4A4A] leading-relaxed">{nudo.abc.belief}</p>
        </div>

        <div className="p-5 bg-[#F7F5F2] rounded-[1.5rem] border border-[#E8D8CC]/60">
          <span className="text-[10px] font-bold tracking-widest text-[#C17B5C] uppercase mb-2 block">
            C — Consecuencia
          </span>
          <p className="text-sm text-[#4A4A4A] leading-relaxed">{nudo.abc.consequence}</p>
        </div>
      </div>

      {nudo.alternativeThought && (
        <div className="bg-[#F2E8DE]/50 border border-[#C17B5C]/20 rounded-[1.5rem] p-5">
          <span className="text-[10px] font-bold tracking-widest text-[#C17B5C] uppercase mb-2 block">
            Pensamiento alternativo
          </span>
          <p className="text-sm text-[#4A4A4A] leading-relaxed italic">
            {nudo.alternativeThought}
          </p>
        </div>
      )}

      <div className="pt-2">
        <Link
          to="/nudos"
          className="inline-flex items-center justify-center px-6 py-4 rounded-[2rem] text-sm font-semibold text-[#4A4A4A] border border-[#E8D8CC] bg-white/80 hover:bg-white transition-colors"
        >
          Volver a Mis Nudos
        </Link>
      </div>
    </motion.div>
  );
}
