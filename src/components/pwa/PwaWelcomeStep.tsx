import { motion, AnimatePresence } from "motion/react";
import {
  Check,
  MoreVertical,
  Share,
  Smartphone,
  Sparkles,
  Zap,
} from "lucide-react";
import { Fragment, useState } from "react";
import { detectDefaultPlatform, type PwaPlatform } from "../../lib/pwaWelcome";

interface PwaWelcomeStepProps {
  onContinue: () => void;
}

interface InstallStep {
  text: string;
  icon: typeof Share;
}

const IOS_STEPS: InstallStep[] = [
  {
    text: 'Pulsa **"Entrar al Chat"** arriba y, una vez dentro del chat, toca **Compartir** en Safari (el icono del cuadrado con la flecha hacia arriba en la barra inferior).',
    icon: Share,
  },
  {
    text: 'Desplaza el menú hacia abajo y selecciona **"Añadir a la pantalla de inicio"**.',
    icon: Smartphone,
  },
  {
    text: 'Toca **"Añadir"** en la esquina superior derecha. El acceso directo abrirá el chat al instante.',
    icon: Check,
  },
];

const ANDROID_STEPS: InstallStep[] = [
  {
    text: 'Pulsa **"Entrar al Chat"** arriba y, una vez dentro del chat, abre el menú de **Chrome** (tres puntos en la esquina superior derecha).',
    icon: MoreVertical,
  },
  {
    text: 'Selecciona **"Instalar aplicación"** o **"Añadir a la pantalla de inicio"**.',
    icon: Smartphone,
  },
  {
    text: 'Confirma tocando **"Instalar"**. El icono abrirá el chat directamente gracias al acceso directo.',
    icon: Check,
  },
];

const TABS: { id: PwaPlatform; label: string }[] = [
  { id: "ios", label: "iPhone (iOS)" },
  { id: "android", label: "Android" },
];

function FormattedText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className="font-semibold text-[#2A3540]">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

function StepCard({
  number,
  text,
  icon: Icon,
  delay,
}: {
  number: number;
  text: string;
  icon: typeof Share;
  delay: number;
}) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className="flex gap-4 p-4 md:p-5 bg-white/80 border border-[#C8DAE8] rounded-2xl shadow-sm"
    >
      <div className="shrink-0 flex flex-col items-center gap-2">
        <div className="w-12 h-12 rounded-2xl bg-[#E3EFF8] flex items-center justify-center">
          <span className="text-2xl font-serif font-semibold text-[#7EB8DA] leading-none">
            {number}
          </span>
        </div>
        <div className="w-8 h-8 rounded-xl bg-[#EEF6FC] border border-[#DDEAF5] flex items-center justify-center">
          <Icon className="w-4 h-4 text-[#7EB8DA]/80" strokeWidth={2} />
        </div>
      </div>
      <p className="flex-1 text-sm md:text-[15px] text-[#5A7080] leading-relaxed pt-1">
        <FormattedText text={text} />
      </p>
    </motion.li>
  );
}

function PlatformSteps({ platform }: { platform: PwaPlatform }) {
  const steps = platform === "ios" ? IOS_STEPS : ANDROID_STEPS;

  return (
    <motion.ul
      key={platform}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="space-y-3"
    >
      {steps.map((step, index) => (
        <Fragment key={`${platform}-${index}`}>
          <StepCard
            number={index + 1}
            text={step.text}
            icon={step.icon}
            delay={index * 0.08}
          />
        </Fragment>
      ))}
    </motion.ul>
  );
}

export default function PwaWelcomeStep({ onContinue }: PwaWelcomeStepProps) {
  const [platform, setPlatform] = useState<PwaPlatform>(detectDefaultPlatform);

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <span className="inline-flex items-center gap-1.5 text-[#7EB8DA] uppercase tracking-[0.2em] text-[10px] font-black bg-[#E3EFF8] px-3 py-1 rounded-full mb-5">
          <Sparkles className="w-3 h-3" />
          Instala K-Notes
        </span>
        <h1 className="text-3xl md:text-4xl font-medium text-[#2A3540] tracking-tight leading-tight">
          Lleva tu diario en el{" "}
          <span className="font-serif italic text-[#7EB8DA]">bolsillo</span>
        </h1>
        <p className="mt-4 text-base md:text-lg text-[#5A7080] leading-relaxed max-w-lg mx-auto">
          Entra al chat ahora y, si quieres, crea un acceso directo en tu pantalla de inicio para
          abrirlo al instante, a pantalla completa y con una experiencia nativa impecable.
        </p>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <button
          type="button"
          onClick={onContinue}
          className="w-full bg-[#7EB8DA] text-white px-8 py-4 rounded-[2rem] text-base font-semibold shadow-xl shadow-[#7EB8DA]/15 hover:bg-[#5A9BC4] hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7EB8DA]"
        >
          Entrar al Chat
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="text-center"
      >
        <p className="text-sm font-semibold text-[#2A3540]">¿Quieres acceso directo?</p>
        <p className="mt-1 text-sm text-[#5A7080] leading-relaxed max-w-md mx-auto">
          Opcional: sigue estos pasos <strong className="font-semibold text-[#2A3540]">después</strong> de
          entrar al chat para que el icono abra la conversación directamente.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="relative flex p-1 bg-white/70 backdrop-blur-md border border-[#C8DAE8] rounded-full shadow-sm max-w-sm mx-auto">
          {TABS.map(({ id, label }) => {
            const active = platform === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setPlatform(id)}
                className={`relative flex-1 px-4 py-2.5 rounded-full text-sm font-medium transition-colors z-10 ${
                  active ? "text-white" : "text-[#5A7080] hover:text-[#2A3540]"
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="pwa-platform-tab"
                    className="absolute inset-0 bg-[#7EB8DA] rounded-full shadow-sm"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{label}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        <PlatformSteps platform={platform} />
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="flex items-start gap-3 p-4 md:p-5 bg-[#E3EFF8]/40 border border-[#C8DAE8] rounded-2xl"
      >
        <div className="shrink-0 w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm">
          <Zap className="w-4 h-4 text-[#7EB8DA]" />
        </div>
        <p className="text-sm text-[#5A7080] leading-relaxed">
          <strong className="font-semibold text-[#2A3540]">Instalación instantánea:</strong>{" "}
          Ocupa menos de 1 MB, no consume almacenamiento y se actualiza automáticamente.
        </p>
      </motion.div>
    </div>
  );
}
