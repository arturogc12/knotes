import { Link, useLocation } from "react-router-dom";
import { BookHeart, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isProfessionals = location.pathname === "/profesionales";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#F7F5F2]/90 backdrop-blur-md border-b border-[#E8E4DF]">
      <div className="w-full px-6 md:px-12">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-[#8DA399] rounded-xl flex items-center justify-center transition-transform group-hover:scale-105">
              <span className="text-white font-serif italic text-lg font-bold">K</span>
            </div>
            <span className="font-sans font-semibold text-xl tracking-tight text-[#2D2D2D]">
              K-Notes
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
            <Link
              to={isProfessionals ? "/" : "/profesionales"}
              className="text-xs font-bold uppercase tracking-[0.15em] text-[#4A4A4A] hover:text-[#8DA399] transition-colors"
            >
              {isProfessionals ? "Para Pacientes" : "Para Profesionales"}
            </Link>
            <Link
              to="/login"
              className="bg-[#8DA399] text-white px-7 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#7D9389] transition-all shadow-sm"
            >
              Iniciar Sesión
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-[#4A4A4A] hover:text-[#2D2D2D] p-2"
              aria-label="Menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-[#E8E4DF] bg-[#F7F5F2] overflow-hidden"
          >
            <div className="px-6 py-6 space-y-6 flex flex-col items-center">
              <Link
                to={isProfessionals ? "/" : "/profesionales"}
                onClick={() => setIsOpen(false)}
                className="block text-xs font-bold uppercase tracking-[0.15em] text-[#4A4A4A] hover:text-[#8DA399]"
              >
                {isProfessionals ? "Para Pacientes" : "Para Profesionales"}
              </Link>
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="w-full inline-flex items-center justify-center px-7 py-3 text-xs font-bold uppercase tracking-widest text-white bg-[#8DA399] rounded-full shadow-sm active:scale-95 transition-transform"
              >
                Iniciar Sesión
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
