import { ArrowLeft, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";

export default function Chat() {
  return (
    <div className="h-screen bg-[#F7F5F2] flex flex-col font-sans selection:bg-[#8DA399]/20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-[#E8E4DF] flex items-center justify-between px-4 py-4 shrink-0">
        <Link to="/" className="text-[#4A4A4A] hover:text-[#2D2D2D] transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div className="flex flex-col items-center">
          <div className="w-6 h-6 bg-[#8DA399] rounded flex items-center justify-center mb-1">
            <span className="text-white font-serif italic text-xs font-bold -mt-0.5">K</span>
          </div>
          <h1 className="text-sm font-semibold text-[#2D2D2D] tracking-tight">Tu Lienzo</h1>
        </div>
        <div className="w-6" /> {/* Spacer */}
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 max-w-3xl mx-auto w-full">
        <div className="flex justify-center my-6">
          <span className="text-[10px] font-bold tracking-widest text-[#5D6D66] uppercase bg-white border border-[#E8E4DF] px-4 py-1.5 rounded-full shadow-sm">
            Hoy, 10:45 AM
          </span>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-white rounded-[1.5rem] rounded-tl-sm p-5 text-sm text-[#4A4A4A] shadow-sm max-w-[85%] leading-relaxed"
        >
          <p>Hola. Este es tu espacio seguro para vaciar tus pensamientos. ¿Cómo te sientes hoy?</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#8DA399] text-white rounded-[1.5rem] rounded-tr-sm p-5 text-sm shadow-md max-w-[85%] self-end leading-relaxed"
        >
          <p>Me siento un poco ansioso por una reunión que tengo en la tarde. Tienen que evaluar mi proyecto.</p>
        </motion.div>
        
        <div className="flex-1" />
        <div className="py-4 flex justify-center">
          <p className="text-center text-[10px] font-bold tracking-widest uppercase text-[#5D6D66] opacity-60 max-w-[80%] leading-relaxed">
            La IA de K-Notes estructurará esto en un Autorregistro A-B-C para tu Psicólogo.
          </p>
        </div>
      </main>

      {/* Input Area */}
      <footer className="bg-white/90 backdrop-blur-md border-t border-[#E8E4DF] p-4 shrink-0 pb-safe">
        <div className="max-w-3xl mx-auto relative">
          <input 
            type="text" 
            placeholder="Escribe lo que piensas..." 
            className="w-full bg-[#F7F5F2] border border-[#E8E4DF] rounded-full pl-6 pr-14 py-4 text-sm focus:outline-none focus:bg-white focus:border-[#8DA399] focus:ring-1 focus:ring-[#8DA399] transition-all placeholder-[#5D6D66]/50 shadow-inner"
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#8DA399] rounded-full flex items-center justify-center text-white hover:bg-[#7D9389] transition-colors shadow-md">
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </div>
      </footer>
    </div>
  );
}
