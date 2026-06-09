import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

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

export function AuthCallbackHandler() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const message = parseAuthError(location.search, location.hash);
    if (!message) return;

    navigate("/login", {
      replace: true,
      state: { authError: decodeURIComponent(message.replace(/\+/g, " ")) },
    });
  }, [location.search, location.hash, navigate]);

  return null;
}
