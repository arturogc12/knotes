import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getPostAuthDestination } from "../../lib/authRoutes";

function parseAuthError(search: string, hash: string): string | null {
  const params = new URLSearchParams(search);
  const hashParams = new URLSearchParams(hash.replace(/^#/, ""));

  const description =
    params.get("error_description") ?? hashParams.get("error_description");
  const code = params.get("error_code") ?? hashParams.get("error_code");

  if (!description && !code) return null;

  if (description?.includes("Database error saving new user")) {
    return "No pudimos crear tu perfil. Ejecuta la migración 002_fix_profiles_oauth.sql en Supabase e inténtalo de nuevo.";
  }

  return description ?? code ?? "Error al iniciar sesión.";
}

function hasAuthCallbackParams(search: string, hash: string): boolean {
  const params = new URLSearchParams(search);
  const hashParams = new URLSearchParams(hash.replace(/^#/, ""));

  return (
    params.has("code") ||
    hashParams.has("access_token") ||
    hashParams.has("refresh_token") ||
    hashParams.get("type") === "magiclink" ||
    hashParams.get("type") === "signup" ||
    hashParams.get("type") === "recovery"
  );
}

export function AuthCallbackHandler() {
  const location = useLocation();
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const authCallbackRef = useRef(hasAuthCallbackParams(location.search, location.hash));
  const redirectedRef = useRef(false);

  useEffect(() => {
    const message = parseAuthError(location.search, location.hash);
    if (!message) return;

    navigate("/login", {
      replace: true,
      state: { authError: decodeURIComponent(message.replace(/\+/g, " ")) },
    });
  }, [location.search, location.hash, navigate]);

  useEffect(() => {
    if (loading || redirectedRef.current || !session) return;

    const isOAuthReturn =
      authCallbackRef.current || hasAuthCallbackParams(location.search, location.hash);
    const isLandingAfterAuth = location.pathname === "/";

    if (!isOAuthReturn && !isLandingAfterAuth) {
      if (location.pathname === "/bienvenida" && (location.hash || location.search)) {
        window.history.replaceState({}, "", "/bienvenida");
      }
      return;
    }

    redirectedRef.current = true;
    authCallbackRef.current = false;
    const destination = getPostAuthDestination(session.user.id);
    navigate(destination, { replace: true });
  }, [loading, session, location.pathname, location.search, location.hash, navigate]);

  return null;
}
