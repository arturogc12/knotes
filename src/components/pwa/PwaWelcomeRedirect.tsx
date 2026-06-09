import { useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { hasSeenPwaWelcome } from "../../lib/pwaWelcome";
import type { ReactNode } from "react";

type WelcomeLocationState = {
  welcomeDismissed?: boolean;
};

export function PwaWelcomeRedirect({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as WelcomeLocationState | null;
  const welcomeDismissed = state?.welcomeDismissed === true;

  useEffect(() => {
    if (!welcomeDismissed) return;
    navigate(".", { replace: true, state: {} });
  }, [welcomeDismissed, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5F2] flex items-center justify-center font-sans">
        <div className="w-10 h-10 bg-[#C17B5C] rounded-xl flex items-center justify-center animate-pulse">
          <span className="text-white font-serif italic text-lg font-bold">K</span>
        </div>
      </div>
    );
  }

  if (user && !welcomeDismissed && !hasSeenPwaWelcome(user.id)) {
    return <Navigate to="/bienvenida" replace />;
  }

  return children;
}
