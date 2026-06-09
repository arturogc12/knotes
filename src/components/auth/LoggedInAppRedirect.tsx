import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getPostAuthDestination, isPublicMarketingRoute } from "../../lib/authRoutes";

const HISTORY_ROOTED_KEY = "knotes:app-stack-rooted";

export function LoggedInAppRedirect() {
  const location = useLocation();
  const navigate = useNavigate();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (loading || !session) return;

    if (isPublicMarketingRoute(location.pathname)) {
      const destination = getPostAuthDestination(session.user.id);
      navigate(destination, { replace: true });
    }
  }, [loading, session, location.pathname, navigate]);

  useEffect(() => {
    if (loading || !session) return;

    const isPatientRoute =
      location.pathname === "/chat" ||
      location.pathname === "/nudos" ||
      location.pathname.startsWith("/nudos/") ||
      location.pathname === "/ajustes";

    if (!isPatientRoute) return;

    try {
      if (sessionStorage.getItem(HISTORY_ROOTED_KEY) === "1") return;
      sessionStorage.setItem(HISTORY_ROOTED_KEY, "1");
      navigate(location.pathname + location.search + location.hash, { replace: true });
    } catch {
      navigate(location.pathname + location.search + location.hash, { replace: true });
    }
  }, [loading, session, location.pathname, location.search, location.hash, navigate]);

  return null;
}
