import { motion } from "motion/react";
import { Bot, FileText, Activity, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Professionals() {
  return (
    <main className="flex flex-col flex-1 pt-20 bg-[#F7F5F2]">
      {/* Hero Section */}
      <section className="relative px-6 sm:px-12 lg:px-16 py-20 max-w-[1400px] mx-auto w-full flex flex-col md:flex-row items-center gap-12 overflow-hidden">
        
        <div className="flex-1 text-left relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-8"
          >
            <span className="text-[#8DA399] uppercase tracking-[0.2em] text-[10px] font-black bg-[#E8EEEB] px-3 py-1 rounded-full inline-flex items-center gap-2">
              <Activity className="w-3 h-3" />
              Herramienta clínica para Terapeutas
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="text-5xl lg:text-[64px] font-medium leading-[1.05] text-[#2D2D2D] tracking-tight mb-6"
          >
            Tu paciente se desahoga. K‑Notes hace el 
            <span className="text-[#8DA399] font-serif italic"> Análisis Funcional.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="text-xl opacity-75 leading-relaxed max-w-lg mb-10 text-[#4A4A4A]"
          >
            Di adiós a los tediosos autorregistros manuales o en Word. Nuestra IA estructura la narrativa del paciente extrayendo Antecedentes, Conductas y Consecuencias (A-B-C) de forma invisible.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          >
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-10 py-5 text-lg font-semibold text-white bg-[#8DA399] hover:bg-[#7D9389] rounded-[2rem] transition-all shadow-xl shadow-[#8DA399]/10 hover:-translate-y-0.5 group"
            >
              Comenzar a usar K-Notes
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* Visual Mockup */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="flex-1 w-full relative"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#8DA399]/10 rounded-full blur-3xl -z-10" />
          <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-[#E8E4DF] aspect-square flex flex-col max-w-md mx-auto">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#E8EEEB] rounded-2xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-[#8DA399]" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#2D2D2D] text-lg">Reporte Semanal</h4>
                  <p className="text-xs text-[#5D6D66]">Generado automáticamente</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4 flex-1">
              <div className="p-5 bg-[#F7F5F2] rounded-[1.5rem]">
                <span className="text-[10px] font-bold tracking-widest text-[#8DA399] uppercase mb-2 block">A - Antecedente</span>
                <p className="text-sm text-[#4A4A4A] leading-relaxed">Situación de ansiedad social en reunión.</p>
              </div>
              <div className="p-5 bg-[#F7F5F2] rounded-[1.5rem]">
                <span className="text-[10px] font-bold tracking-widest text-[#8DA399] uppercase mb-2 block">B - Conducta / Pensamiento</span>
                <p className="text-sm text-[#4A4A4A] leading-relaxed">"Van a notar que me tiembla la voz". Evitación visual.</p>
              </div>
              <div className="p-5 bg-[#F7F5F2] rounded-[1.5rem]">
                <span className="text-[10px] font-bold tracking-widest text-[#8DA399] uppercase mb-2 block">C - Consecuencia</span>
                <p className="text-sm text-[#4A4A4A] leading-relaxed">Alivio a corto plazo, frustración y culpa a largo plazo.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Benefits grid */}
      <section className="px-6 sm:px-12 lg:px-16 py-20 bg-white border-t border-[#E8E4DF]">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div className="flex flex-col justify-center max-w-xl">
             <div className="w-14 h-14 bg-[#E8EEEB] text-[#8DA399] rounded-[1.5rem] flex items-center justify-center mb-8">
              <Bot className="w-7 h-7" />
            </div>
            <h3 className="font-serif italic text-4xl mb-6 text-[#2D2D2D]">Informes limpios listos para tu sesión</h3>
            <p className="text-lg opacity-75 text-[#4A4A4A] leading-relaxed">
              El paciente percibe la aplicación como un bloc de notas seguro de uso libre. Tras bambalinas, K-Notes compila, organiza y etiqueta las entradas para generar PDFs clínicos estructurados, permitiéndote ir directo al grano y optimizar tu tiempo.
            </p>
          </div>

           <div className="bg-[#F7F5F2] rounded-[3rem] p-8 aspect-video flex items-center justify-center border border-[#E8E4DF] relative overflow-hidden">
               <div className="absolute inset-0 bg-[radial-gradient(#8DA399_1px,transparent_1px)] [background-size:24px_24px] opacity-10"></div>
               <div className="relative z-10 text-center bg-white/80 backdrop-blur-md px-8 py-4 rounded-2xl shadow-sm border border-[#E8E4DF]">
                   <p className="text-[#8DA399] font-bold text-xs uppercase tracking-widest">Visualizador de estadísticas</p>
               </div>
           </div>
        </div>
      </section>
    </main>
  );
}
