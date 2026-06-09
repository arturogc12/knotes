import { motion } from "motion/react";
import { Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import type { FormEvent } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { session, loading, signInWithOtp, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const authError = (location.state as { authError?: string } | null)?.authError;
    if (authError) {
      setError(authError);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  useEffect(() => {
    if (!loading && session) {
      navigate("/chat", { replace: true });
    }
  }, [loading, session, navigate]);

  const handleMagicLink = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);

    const { error: authError } = await signInWithOtp(email.trim());
    setSubmitting(false);

    if (authError) {
      setError(t("login.error"));
      return;
    }

    setMessage(t("login.checkEmail"));
  };

  const handleGoogle = async () => {
    setError(null);
    setMessage(null);
    setSubmitting(true);

    const { error: authError } = await signInWithGoogle();
    setSubmitting(false);

    if (authError) {
      setError(t("login.error"));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5F2] flex items-center justify-center font-sans">
        <div className="w-10 h-10 bg-[#C17B5C] rounded-xl flex items-center justify-center animate-pulse">
          <span className="text-white font-serif italic text-lg font-bold">K</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F5F2] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-[#C17B5C]/20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-[#C17B5C] rounded-xl flex items-center justify-center">
            <span className="text-white font-serif italic text-2xl font-bold">K</span>
          </div>
        </div>
        <h2 className="mt-6 text-center font-sans text-3xl font-semibold tracking-tight text-[#2D2D2D]">
          {t("login.title")}
        </h2>
        <p className="mt-2 text-center text-sm text-[#5D6D66] opacity-80">{t("login.subtitle")}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="bg-white py-8 px-4 shadow-xl shadow-[#C17B5C]/5 border border-[#E8D8CC] sm:rounded-[2rem] sm:px-10">
          <form className="space-y-6" onSubmit={handleMagicLink}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#4A4A4A]">
                {t("login.email")}
              </label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-[#C17B5C]/60" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("login.emailPlaceholder")}
                  className="appearance-none block w-full pl-11 pr-4 py-3.5 border border-[#E8D8CC] rounded-xl bg-[#F7F5F2]/50 shadow-sm placeholder-[#5D6D66]/50 focus:outline-none focus:ring-2 focus:ring-[#C17B5C]/50 focus:border-[#C17B5C]/50 focus:bg-white sm:text-sm transition-all"
                />
              </div>
            </div>

            {message && (
              <p className="text-sm text-[#5D6D66] bg-[#F2E8DE]/50 border border-[#E8D8CC] rounded-xl px-4 py-3">
                {message}
              </p>
            )}

            {error && (
              <p className="text-sm text-[#A86548] bg-[#F2E8DE]/30 border border-[#C17B5C]/30 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            <div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center py-3.5 px-4 rounded-[2rem] shadow-sm text-sm font-semibold text-white bg-[#C17B5C] hover:bg-[#A86548] hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C17B5C] transition-all disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {t("login.magicLink")}
              </button>
            </div>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#E8D8CC]" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white text-[#5D6D66] font-medium text-xs uppercase tracking-widest">
                    {t("login.divider")}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleGoogle}
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-3 py-3.5 px-4 border border-[#E8D8CC] rounded-[2rem] shadow-sm text-sm font-semibold text-[#4A4A4A] bg-white hover:bg-[#F7F5F2] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C17B5C] transition-colors disabled:opacity-60"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  {t("login.google")}
                </button>
              </div>
            </div>

            <p className="text-xs text-center text-[#5D6D66] mt-8 px-4 opacity-75">
              {t("login.footer")}
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
