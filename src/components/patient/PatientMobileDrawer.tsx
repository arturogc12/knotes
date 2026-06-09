import { AnimatePresence, motion } from "motion/react";
import { Layers, MessageCircle, Settings, X } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { usePatientDrawer } from "../../contexts/PatientDrawerContext";

const navItems = [
  { to: "/chat", labelKey: "nav.conversation" as const, icon: MessageCircle },
  { to: "/nudos", labelKey: "nav.nudos" as const, icon: Layers },
  { to: "/ajustes", labelKey: "nav.settings" as const, icon: Settings },
] as const;

function isActive(pathname: string, to: string) {
  if (to === "/nudos") return pathname === "/nudos" || pathname.startsWith("/nudos/");
  return pathname === to;
}

export function PatientMobileDrawer() {
  const { isOpen, close } = usePatientDrawer();
  const { pathname } = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    close();
  }, [pathname, close]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
            aria-label="Cerrar menú"
            className="md:hidden fixed inset-0 z-40 bg-[#2D2D2D]/30 backdrop-blur-[2px]"
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
            className="md:hidden fixed top-0 left-0 bottom-0 z-50 w-[min(280px,85vw)] bg-[#F7F5F2] border-r border-[#E8D8CC] shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-4 border-b border-[#E8D8CC]/80">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-[#C17B5C] rounded-xl flex items-center justify-center shadow-sm">
                  <span className="text-white font-serif italic text-lg font-bold">K</span>
                </div>
                <span className="font-sans font-semibold text-lg tracking-tight text-[#2D2D2D]">
                  K-Notes
                </span>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Cerrar menú"
                className="p-2 rounded-xl text-[#5D6D66] hover:text-[#2D2D2D] hover:bg-white/70 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2">
              {navItems.map(({ to, labelKey, icon: Icon }) => {
                const active = isActive(pathname, to);
                return (
                  <Link
                    key={to}
                    to={to}
                    onClick={close}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all ${
                      active
                        ? "bg-[#C17B5C] text-white shadow-sm"
                        : "text-[#5D6D66] hover:text-[#2D2D2D] hover:bg-white/80 border border-transparent hover:border-[#E8D8CC]"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {t(labelKey)}
                  </Link>
                );
              })}
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
