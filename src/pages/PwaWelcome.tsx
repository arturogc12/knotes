import { motion } from "motion/react";
import { Navigate, useNavigate } from "react-router-dom";
import PwaWelcomeStep from "../components/pwa/PwaWelcomeStep";
import { useAuth } from "../contexts/AuthContext";
import { hasSeenPwaWelcome, isMobileDevice, markPwaWelcomeSeen } from "../lib/pwaWelcome";

export default function PwaWelcome() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5F2] flex items-center justify-center font-sans">
        <div className="w-10 h-10 bg-[#C17B5C] rounded-xl flex items-center justify-center animate-pulse">
          <span className="text-white font-serif italic text-lg font-bold">K</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isMobileDevice()) {
    return <Navigate to="/chat" replace />;
  }

  if (hasSeenPwaWelcome(user.id)) {
    return <Navigate to="/chat" replace />;
  }

  const handleContinue = () => {
    markPwaWelcomeSeen(user.id);
    navigate("/chat", { replace: true, state: { welcomeDismissed: true } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F7F5F2] to-[#F2E8DE] flex flex-col font-sans selection:bg-[#C17B5C]/20 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#C17B5C]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-24 left-0 w-48 h-48 bg-[#C17B5C]/8 rounded-full blur-3xl pointer-events-none" />

      <header className="relative z-10 shrink-0 px-4 pt-8 pb-2">
        <div className="max-w-lg mx-auto flex justify-center">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-[#C17B5C] rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white font-serif italic text-lg font-bold">K</span>
            </div>
            <span className="font-sans font-semibold text-lg tracking-tight text-[#2D2D2D]">
              K-Notes
            </span>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col px-4 pb-10 pt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-lg mx-auto w-full bg-white/90 border border-[#E8D8CC] rounded-[2rem] p-6 md:p-8 shadow-xl shadow-[#C17B5C]/10"
        >
          <PwaWelcomeStep onContinue={handleContinue} />
        </motion.div>
      </main>
    </div>
  );
}
