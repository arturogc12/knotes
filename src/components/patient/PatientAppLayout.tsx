import { AnimatePresence, motion } from "motion/react";
import { Link, useLocation, useNavigationType, useOutlet } from "react-router-dom";
import { Layers, Menu, MessageCircle, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ChatSessionProvider } from "../../contexts/ChatSessionContext";
import { PatientDrawerProvider, usePatientDrawer } from "../../contexts/PatientDrawerContext";
import { PatientMobileDrawer } from "./PatientMobileDrawer";

const tabs = [
  { to: "/chat", labelKey: "nav.conversation" as const, icon: MessageCircle },
  { to: "/nudos", labelKey: "nav.nudos" as const, icon: Layers },
] as const;

function isTabActive(pathname: string, tabPath: string) {
  if (tabPath === "/nudos") {
    return pathname === "/nudos" || pathname.startsWith("/nudos/");
  }
  return pathname === tabPath;
}

function AnimatedPatientOutlet() {
  const location = useLocation();
  const outlet = useOutlet();
  const navigationType = useNavigationType();
  const isPop = navigationType === "POP";

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={isPop ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: isPop ? 0.1 : 0.15 }}
        className="flex-1 flex flex-col min-h-0 w-full"
      >
        {outlet}
      </motion.div>
    </AnimatePresence>
  );
}

function PatientAppLayoutInner() {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const { open } = usePatientDrawer();
  const settingsActive = pathname === "/ajustes";
  const isChatRoute = pathname === "/chat";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F9FC] to-[#E3EFF8] flex flex-col font-sans selection:bg-[#7EB8DA]/20 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#7EB8DA]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-32 left-0 w-48 h-48 bg-[#7EB8DA]/8 rounded-full blur-3xl pointer-events-none" />

      <PatientMobileDrawer />

      <header
        className={`relative z-10 shrink-0 px-4 pt-6 pb-2 md:pt-8 ${isChatRoute ? "max-md:hidden" : ""}`}
      >
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-4">
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={open}
                aria-label="Abrir menú"
                className="md:hidden p-2.5 rounded-xl text-[#5A7080] hover:text-[#2A3540] hover:bg-white/70 border border-transparent hover:border-[#C8DAE8] transition-all"
              >
                <Menu className="w-5 h-5" />
              </button>

              <Link to="/chat" className="flex items-center gap-2 group">
                <div className="w-9 h-9 bg-[#7EB8DA] rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm">
                  <span className="text-white font-serif italic text-lg font-bold">K</span>
                </div>
                <span className="font-sans font-semibold text-lg tracking-tight text-[#2A3540]">
                  K-Notes
                </span>
              </Link>
            </div>

            <Link
              to="/ajustes"
              aria-label={t("nav.settings")}
              className={`hidden md:flex p-2.5 rounded-xl transition-all ${
                settingsActive
                  ? "bg-[#7EB8DA] text-white shadow-sm"
                  : "text-[#5A7080] hover:text-[#2A3540] hover:bg-white/70 border border-transparent hover:border-[#C8DAE8]"
              }`}
            >
              <Settings className="w-5 h-5" />
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <nav className="flex items-center gap-1 p-1 bg-white/70 backdrop-blur-md border border-[#C8DAE8] rounded-full shadow-sm">
              {tabs.map(({ to, labelKey, icon: Icon }) => {
                const active = isTabActive(pathname, to);
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                      active
                        ? "bg-[#7EB8DA] text-white shadow-sm"
                        : "text-[#5A7080] hover:text-[#2A3540] hover:bg-[#F5F9FC]"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {t(labelKey)}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      <main
        className={`relative z-10 flex-1 flex flex-col min-h-0 pt-2 ${
          isChatRoute
            ? "max-md:px-0 max-md:pb-0 max-md:pt-0 md:px-4 md:pb-8"
            : "px-4 pb-6 max-md:pb-6 md:pb-8"
        }`}
      >
        <div
          className={`mx-auto w-full flex-1 flex flex-col min-h-0 ${
            isChatRoute ? "max-md:max-w-none max-w-4xl" : "max-w-4xl"
          }`}
        >
          <AnimatedPatientOutlet />
        </div>
      </main>
    </div>
  );
}

export function PatientAppLayout() {
  return (
    <ChatSessionProvider>
      <PatientDrawerProvider>
        <PatientAppLayoutInner />
      </PatientDrawerProvider>
    </ChatSessionProvider>
  );
}
