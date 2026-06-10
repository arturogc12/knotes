import { AnimatePresence, motion } from "motion/react";
import { Layers, MessageCircle, Settings, SquarePen, X } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { usePatientDrawer } from "../../contexts/PatientDrawerContext";
import { useNewConversation } from "../../hooks/useNewConversation";

const navItems = [
  { to: "/chat", labelKey: "nav.conversation" as const, icon: MessageCircle },
  { to: "/nudos", labelKey: "nav.nudos" as const, icon: Layers },
] as const;

function isActive(pathname: string, to: string) {
  if (to === "/nudos") return pathname === "/nudos" || pathname.startsWith("/nudos/");
  return pathname === to;
}

export function PatientMobileDrawer() {
  const { isOpen, close } = usePatientDrawer();
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const { startNewConversation, disabled: newConversationDisabled } = useNewConversation();

  const handleNewConversation = () => {
    void startNewConversation().then((started) => {
      if (started) close({ skipHistory: true });
    });
  };

  useEffect(() => {
    close({ skipHistory: true });
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
            className="md:hidden fixed inset-0 z-40 bg-[#2A3540]/30 backdrop-blur-[2px]"
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
            className="md:hidden fixed top-0 left-0 bottom-0 z-50 w-[min(280px,85vw)] bg-[#F5F9FC] border-r border-[#C8DAE8] shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-4 border-b border-[#C8DAE8]/80">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-[#7EB8DA] rounded-xl flex items-center justify-center shadow-sm">
                  <span className="text-white font-serif italic text-lg font-bold">K</span>
                </div>
                <span className="font-sans font-semibold text-lg tracking-tight text-[#2A3540]">
                  K-Notes
                </span>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Cerrar menú"
                className="p-2 rounded-xl text-[#5A7080] hover:text-[#2A3540] hover:bg-white/70 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2">
              <button
                type="button"
                onClick={handleNewConversation}
                disabled={newConversationDisabled}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium text-[#5A7080] hover:text-[#2A3540] hover:bg-white/80 border border-transparent hover:border-[#C8DAE8] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SquarePen className="w-5 h-5" />
                {t("chat.newConversation")}
              </button>
              {navItems.map(({ to, labelKey, icon: Icon }) => {
                const active = isActive(pathname, to);
                return (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => close({ skipHistory: true })}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all ${
                      active
                        ? "bg-[#7EB8DA] text-white shadow-sm"
                        : "text-[#5A7080] hover:text-[#2A3540] hover:bg-white/80 border border-transparent hover:border-[#C8DAE8]"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {t(labelKey)}
                  </Link>
                );
              })}
            </nav>

            <div className="px-4 pb-6">
              <div className="border-t border-[#C8DAE8]/80 pt-4">
                <Link
                  to="/ajustes"
                  onClick={() => close({ skipHistory: true })}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all ${
                    isActive(pathname, "/ajustes")
                      ? "bg-[#7EB8DA] text-white shadow-sm"
                      : "text-[#5A7080] hover:text-[#2A3540] hover:bg-white/80 border border-transparent hover:border-[#C8DAE8]"
                  }`}
                >
                  <Settings className="w-5 h-5" />
                  {t("nav.settings")}
                </Link>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
