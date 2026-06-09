import { Link, Outlet, useLocation } from "react-router-dom";
import { Layers, MessageCircle, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";

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

export function PatientAppLayout() {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const settingsActive = pathname === "/ajustes";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F7F5F2] to-[#F2E8DE] flex flex-col font-sans selection:bg-[#C17B5C]/20 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#C17B5C]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-32 left-0 w-48 h-48 bg-[#C17B5C]/8 rounded-full blur-3xl pointer-events-none" />

      <header className="relative z-10 shrink-0 px-4 pt-6 pb-2 md:pt-8">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-4">
          <div className="w-full flex items-center justify-between">
            <Link to="/chat" className="flex items-center gap-2 group">
              <div className="w-9 h-9 bg-[#C17B5C] rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm">
                <span className="text-white font-serif italic text-lg font-bold">K</span>
              </div>
              <span className="font-sans font-semibold text-lg tracking-tight text-[#2D2D2D]">
                K-Notes
              </span>
            </Link>

            <Link
              to="/ajustes"
              aria-label={t("nav.settings")}
              className={`p-2.5 rounded-xl transition-all ${
                settingsActive
                  ? "bg-[#C17B5C] text-white shadow-sm"
                  : "text-[#5D6D66] hover:text-[#2D2D2D] hover:bg-white/70 border border-transparent hover:border-[#E8D8CC]"
              }`}
            >
              <Settings className="w-5 h-5" />
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-1 p-1 bg-white/70 backdrop-blur-md border border-[#E8D8CC] rounded-full shadow-sm">
            {tabs.map(({ to, labelKey, icon: Icon }) => {
              const active = isTabActive(pathname, to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                    active
                      ? "bg-[#C17B5C] text-white shadow-sm"
                      : "text-[#5D6D66] hover:text-[#2D2D2D] hover:bg-[#F7F5F2]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {t(labelKey)}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col min-h-0 px-4 pb-24 md:pb-8 pt-2">
        <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col min-h-0">
          <Outlet />
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-white/90 backdrop-blur-md border-t border-[#E8D8CC] px-4 pb-safe">
        <div className="flex items-center justify-around py-2 max-w-lg mx-auto">
          {tabs.map(({ to, labelKey, icon: Icon }) => {
            const active = isTabActive(pathname, to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex flex-col items-center gap-1 px-6 py-2 rounded-2xl transition-colors ${
                  active ? "text-[#C17B5C]" : "text-[#5D6D66]"
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? "stroke-[2.5]" : ""}`} />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  {t(labelKey)}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
