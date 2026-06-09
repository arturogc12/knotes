import { motion } from "motion/react";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const monthlyFeatures = [
  "Acceso ilimitado al chat de IA cognitivo-conductual.",
  "Diario inteligente y registro de pensamientos.",
  "Exportación ilimitada de informes en PDF.",
  "Sin permanencia, cancela cuando quieras.",
];

const annualFeatures = [
  "Incluye todo lo del Plan Mensual.",
  "Equivale a solo 4,99 € al mes.",
  "Un único pago anual.",
  "Ahorra un 50% frente al pago mensual.",
];

function PricingCard({
  label,
  price,
  features,
  discountText,
  ctaLabel,
  highlighted = false,
  delay = 0,
}: {
  label: string;
  price: string;
  features: string[];
  discountText: string;
  ctaLabel: string;
  highlighted?: boolean;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={`flex flex-col h-full p-8 sm:p-10 rounded-[2rem] border transition-all ${
        highlighted
          ? "bg-white border-[#C17B5C]/40 shadow-xl shadow-[#C17B5C]/10 lg:scale-[1.02] lg:-translate-y-1 relative z-10"
          : "bg-white/90 border-[#E8D8CC] shadow-sm"
      }`}
    >
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C17B5C] bg-[#F2E8DE] px-3 py-1 rounded-full self-start mb-6">
        {label}
      </span>

      <p className="text-4xl sm:text-[2.75rem] font-medium text-[#2D2D2D] tracking-tight mb-8">
        {price}
      </p>

      <ul className="space-y-4 mb-8 flex-1">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <span
              className={`mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                highlighted ? "bg-[#C17B5C] text-white" : "bg-[#F2E8DE] text-[#C17B5C]"
              }`}
            >
              <Check className="w-3 h-3" strokeWidth={3} />
            </span>
            <span className="text-[#5D6D66] leading-relaxed text-sm sm:text-base">
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <p className="text-sm text-[#4A4A4A] leading-relaxed mb-8 p-4 rounded-2xl bg-[#F7F5F2] border border-[#E8D8CC]/60">
        {discountText}
      </p>

      <Link
        to="/login"
        className={`inline-flex justify-center px-10 py-5 rounded-[2rem] text-lg font-semibold transition-all hover:-translate-y-0.5 ${
          highlighted
            ? "bg-[#C17B5C] text-white shadow-xl shadow-[#C17B5C]/10 hover:bg-[#A86548]"
            : "border border-[#E8D8CC] bg-white/50 backdrop-blur-sm text-[#4A4A4A] hover:bg-white"
        }`}
      >
        {ctaLabel}
      </Link>
    </motion.div>
  );
}

export default function PricingSection() {
  return (
    <section className="px-6 sm:px-12 lg:px-16 py-20 md:py-28 border-t border-[#E8D8CC] bg-[#F2E8DE]/20">
      <div className="max-w-[1400px] mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center max-w-2xl mx-auto mb-14 md:mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-medium leading-[1.1] text-[#2D2D2D] tracking-tight mb-6">
            Invierte en el rendimiento de{" "}
            <span className="text-[#C17B5C] font-serif italic">tu terapia</span>
          </h2>
          <p className="text-lg sm:text-xl opacity-75 leading-relaxed text-[#4A4A4A]">
            Si ya inviertes en tu salud mental, haz que cada sesión cuente el doble. Llega a
            consulta con el trabajo hecho, por menos de lo que cuesta un café a la semana.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto items-stretch">
          <PricingCard
            label="Para procesos cortos"
            price="9,99 € / mes"
            features={monthlyFeatures}
            discountText="¿Tienes el código de tu terapeuta? Consíguelo por 7,99 € / mes para siempre."
            ctaLabel="Empezar ahora"
            delay={0.1}
          />
          <PricingCard
            label="El precio de una sesión"
            price="59,99 € / año"
            features={annualFeatures}
            discountText="¿Tienes el código de tu terapeuta? Consíguelo por 49,99 € / año para siempre."
            ctaLabel="Optimizar mi terapia"
            highlighted
            delay={0.2}
          />
        </div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="mt-12 md:mt-16 max-w-2xl mx-auto text-center text-sm sm:text-base text-[#5D6D66] leading-relaxed"
        >
          🔒 Privacidad de nivel clínico. Tus datos están completamente cifrados y tú mantienes el
          control total de lo que compartes.
        </motion.p>
      </div>
    </section>
  );
}
