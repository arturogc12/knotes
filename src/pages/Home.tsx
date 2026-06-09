import { motion } from "motion/react";
import { MessageCircleHeart, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main className="flex flex-col flex-1 pt-20 bg-[#F7F5F2] overflow-hidden">
      {/* Hero Section */}
      <section className="relative flex-1 grid grid-cols-1 md:grid-cols-12 gap-0 items-stretch max-w-[1400px] mx-auto w-full mx-auto">
        
        {/* Left Column: Patient Focus */}
        <div className="col-span-1 md:col-span-12 lg:col-span-7 px-8 sm:px-12 pr-12 lg:pr-16 flex flex-col justify-center py-16 relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-8"
          >
            <span className="text-[#C17B5C] uppercase tracking-[0.2em] text-[10px] font-black bg-[#F2E8DE] px-3 py-1 rounded-full">
              CBT-Based Mirroring
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="text-5xl lg:text-[64px] font-medium leading-[1.05] text-[#2D2D2D] tracking-tight max-w-4xl mb-6"
          >
            El diario de terapia que <span className="text-[#C17B5C] font-serif italic">se escribe solo</span> mientras te desahogas.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="text-xl opacity-75 leading-relaxed max-w-lg mb-8 text-[#4A4A4A]"
          >
            Tu espacio de conversación emocional. Transformamos tu diálogo interno en registros clínicos estructurados sin que tengas que hacer nada.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-5 pt-4"
          >
            <Link
              to="/login"
              className="bg-[#C17B5C] text-white px-10 py-5 rounded-[2rem] text-lg font-semibold shadow-xl shadow-[#C17B5C]/10 hover:-translate-y-0.5 transition-transform inline-flex justify-center flex-1 sm:flex-none"
            >
              Empezar mi proceso
            </Link>
            <button className="border border-[#E8D8CC] bg-white/50 backdrop-blur-sm text-[#4A4A4A] px-10 py-5 rounded-[2rem] text-lg font-semibold hover:bg-white transition-all flex-1 sm:flex-none">
              Saber más
            </button>
          </motion.div>
          
          {/* Floating Quote */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            className="mt-16 p-6 border-l-4 border-[#C17B5C]/30 bg-[#F2E8DE]/40 rounded-r-2xl max-w-md hidden md:block"
          >
            <p className="italic text-sm text-[#5D6D66]">
              "Sentía que no tenía tiempo para autorregistros. Con K-Notes, solo hablo con el chat antes de dormir y mi terapeuta recibe todo lo que necesito trabajar en la sesión."
            </p>
            <p className="mt-3 text-[10px] uppercase tracking-widest font-bold opacity-60 text-[#4A4A4A]">
              — Elena R., Paciente en TCC
            </p>
          </motion.div>
        </div>

        {/* Right Column: Visual Preview */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="col-span-1 md:col-span-12 lg:col-span-5 bg-[#F2E8DE]/50 relative flex items-center justify-center p-8 md:p-12 min-h-[500px]"
        >
          {/* Abstract Shape Decoration */}
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-[#C17B5C]/10 rounded-full blur-3xl hidden lg:block" />
          
          <div className="relative w-full max-w-sm z-10">
            {/* Patient Chat View */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl border border-white relative z-10">
              <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
                <div className="w-10 h-10 rounded-full bg-[#F2E8DE] flex items-center justify-center text-[#C17B5C]">
                  <span className="text-xl -mt-1 leading-none">●</span>
                </div>
                <div className="h-2 w-24 bg-gray-100 rounded-full"></div>
              </div>
              <div className="space-y-4 mb-4">
                <div className="bg-[#F7F5F2] p-4 rounded-2xl rounded-tl-none text-xs leading-relaxed text-[#4A4A4A]">¿Cómo fue ese momento de ansiedad en la oficina? Cuéntame libremente.</div>
                <div className="bg-[#C17B5C] text-white p-4 rounded-2xl rounded-tr-none text-xs leading-relaxed ml-8 shadow-md">Sentí un nudo en el pecho cuando mi jefe entró. Pensé: "No voy a terminar a tiempo y me va a despedir".</div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <div className="w-1.5 h-1.5 bg-[#C17B5C] rounded-full animate-pulse"></div>
                <span className="text-[10px] font-bold text-[#C17B5C] uppercase tracking-tighter">IA: Extrayendo Esquema Antecedente-Conducta</span>
              </div>
            </div>

            {/* Overlapping Therapist Report */}
            <div className="absolute -bottom-10 -right-4 w-64 md:-right-8 md:w-72 bg-white/90 backdrop-blur-md p-6 rounded-[2rem] shadow-2xl border border-[#D1E0D9] z-20 hidden sm:block">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-bold text-[#C17B5C] uppercase tracking-widest">Informe Semanal</span>
                <div className="w-6 h-6 bg-[#C17B5C] rounded-lg flex items-center justify-center">
                  <div className="w-2.5 h-3 border-2 border-white rounded-[2px]"></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-400"></div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full"></div>
                </div>
                <div className="h-1.5 w-4/5 bg-gray-100 rounded-full ml-4"></div>
                <div className="h-1.5 w-3/4 bg-gray-100 rounded-full ml-4"></div>
                <div className="h-6"></div>
                <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                  <div className="h-1.5 w-16 bg-[#C17B5C]/40 rounded-full"></div>
                  <div className="h-1.5 w-8 bg-[#C17B5C]/40 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Bottom Feature Bar (Desktop) */}
      <footer className="h-32 px-12 border-t border-[#E8D8CC] hidden md:flex items-center justify-between shrink-0 bg-white/30 w-full">
        <div className="max-w-[1400px] w-full mx-auto flex justify-between items-center">
          <div className="grid grid-cols-3 gap-16">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C17B5C]">Análisis IA</span>
              <span className="text-sm font-medium text-[#4A4A4A]">Esquema Funcional Automatizado</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C17B5C]">Clínico</span>
              <span className="text-sm font-medium text-[#4A4A4A]">Exportación PDF para Sesión</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C17B5C]">Privacidad</span>
              <span className="text-sm font-medium text-[#4A4A4A]">Cifrado E2E & Supabase Auth</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-[#C17B5C] text-[10px] font-bold uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Optimizado para PWA & Móvil
          </div>
        </div>
      </footer>

      {/* Mobile Features */}
      <section className="px-6 py-12 md:hidden">
        <div className="grid grid-cols-1 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white p-8 rounded-[2rem] shadow-sm border border-[#E8D8CC]"
          >
            <div className="w-12 h-12 bg-[#F2E8DE] text-[#C17B5C] rounded-2xl flex items-center justify-center mb-6">
              <MessageCircleHeart className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-2xl font-semibold mb-3 text-[#2D2D2D]">Un chat contigo mismo</h3>
            <p className="text-[#5D6D66] leading-relaxed">
              No tienes que rellenar largos formularios de registro. Simplemente cuéntale a K-Notes 
              cómo te sientes. Es tu momento de soltar.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#F2E8DE]/50 p-8 rounded-[2rem] border border-[#F2E8DE]"
          >
             <div className="w-12 h-12 bg-white text-[#C17B5C] shadow-sm rounded-2xl flex items-center justify-center mb-6">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-2xl font-semibold mb-3 text-[#2D2D2D]">100% Confidencial</h3>
            <p className="text-[#5D6D66] leading-relaxed">
               Tu intimidad primero. Diseño discreto y cifrado E2E.
            </p>
          </motion.div>
        </div>
      </section>

    </main>
  );
}
