import { useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { shouldShowPwaWelcome } from "../../lib/pwaWelcome";
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
      <div className="min-h-screen bg-[#F5F9FC] flex items-center justify-center font-sans">
        <div className="w-10 h-10 bg-[#7EB8DA] rounded-xl flex items-center justify-center animate-pulse">
          <span className="text-white font-serif italic text-lg font-bold">K</span>
        </div>
      </div>
    );
  }

  if (user && !welcomeDismissed && shouldShowPwaWelcome(user.id)) {
    return <Navigate to="/bienvenida" replace />;
  }

  return children;
}
