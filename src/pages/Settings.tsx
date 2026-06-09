import { motion } from "motion/react";
import { CreditCard, Globe, LogOut, Shield, User } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { setLocale } from "../i18n";
import { PLACEHOLDER_SUBSCRIPTION, type Locale } from "../types/settings";

const LOCALES: { id: Locale; labelKey: "es" | "en" }[] = [
  { id: "es", labelKey: "es" },
  { id: "en", labelKey: "en" },
];

function getInitial(email: string | undefined) {
  if (!email) return "?";
  return email.charAt(0).toUpperCase();
}

export default function Settings() {
  const { t, i18n } = useTranslation();
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);

  const currentLocale = (i18n.language === "en" ? "en" : "es") as Locale;
  const subscription = PLACEHOLDER_SUBSCRIPTION;
  const planLabel =
    subscription.plan === "premium"
      ? t("settings.subscription.planPremium")
      : t("settings.subscription.planFree");

  const handleLocaleChange = (locale: Locale) => {
    setLocale(locale);
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      navigate("/login", { replace: true });
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 py-2 md:py-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-[#2D2D2D] tracking-tight">
          {t("settings.title")}
        </h1>
        <p className="mt-1 text-sm text-[#5D6D66]">{t("settings.subtitle")}</p>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/90 border border-[#E8D8CC] rounded-[2rem] p-6 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#F2E8DE] flex items-center justify-center">
            <User className="w-5 h-5 text-[#C17B5C]" />
          </div>
          <h2 className="font-semibold text-[#2D2D2D]">{t("settings.account.title")}</h2>
        </div>
        <div className="flex items-center gap-4">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt=""
              className="w-12 h-12 rounded-full object-cover shrink-0 border border-[#E8D8CC]"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-[#C17B5C] flex items-center justify-center text-white font-semibold text-lg shrink-0">
              {getInitial(profile?.full_name ?? user?.email)}
            </div>
          )}
          <div className="min-w-0">
            {profile?.full_name && (
              <p className="text-sm font-semibold text-[#2D2D2D] truncate">{profile.full_name}</p>
            )}
            <p className="text-xs font-bold uppercase tracking-widest text-[#5D6D66] mt-0.5">
              {t("settings.account.email")}
            </p>
            <p className="text-sm font-medium text-[#2D2D2D] truncate">
              {profile?.email ?? user?.email ?? "—"}
            </p>
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white/90 border border-[#E8D8CC] rounded-[2rem] p-6 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#F2E8DE] flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-[#C17B5C]" />
          </div>
          <h2 className="font-semibold text-[#2D2D2D]">{t("settings.subscription.title")}</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#C17B5C] bg-[#F2E8DE] px-3 py-1 rounded-full">
            {planLabel}
          </span>
        </div>
        <p className="text-sm text-[#5D6D66] mb-1">{t("settings.subscription.description")}</p>
        <p className="text-xs text-[#5D6D66]/80 mb-4">
          {subscription.renewsAt
            ? t("settings.subscription.renews", {
                date: new Date(subscription.renewsAt).toLocaleDateString(
                  currentLocale === "en" ? "en-US" : "es-ES",
                ),
              })
            : t("settings.subscription.noRenewal")}
        </p>
        <button
          type="button"
          className="w-full sm:w-auto px-6 py-3 rounded-[2rem] text-sm font-semibold text-[#5D6D66] bg-[#F7F5F2] border border-[#E8D8CC] cursor-not-allowed opacity-70"
          disabled
        >
          {t("settings.subscription.manage")}
        </button>
        <p className="mt-2 text-xs text-[#C17B5C] font-medium">
          {t("settings.subscription.comingSoon")}
        </p>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/90 border border-[#E8D8CC] rounded-[2rem] p-6 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#F2E8DE] flex items-center justify-center">
            <Globe className="w-5 h-5 text-[#C17B5C]" />
          </div>
          <h2 className="font-semibold text-[#2D2D2D]">{t("settings.language.title")}</h2>
        </div>
        <p className="text-sm text-[#5D6D66] mb-4">{t("settings.language.description")}</p>
        <div className="flex flex-wrap gap-2">
          {LOCALES.map(({ id, labelKey }) => (
            <button
              key={id}
              type="button"
              onClick={() => handleLocaleChange(id)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                currentLocale === id
                  ? "bg-[#C17B5C] text-white shadow-sm"
                  : "bg-white/80 text-[#5D6D66] border border-[#E8D8CC] hover:bg-white"
              }`}
            >
              {t(`settings.language.${labelKey}`)}
            </button>
          ))}
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white/90 border border-[#E8D8CC] rounded-[2rem] p-6 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#F2E8DE] flex items-center justify-center">
            <Shield className="w-5 h-5 text-[#C17B5C]" />
          </div>
          <h2 className="font-semibold text-[#2D2D2D]">{t("settings.privacy.title")}</h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="#"
            className="text-sm font-medium text-[#C17B5C] hover:text-[#A86548] transition-colors"
          >
            {t("settings.privacy.privacyPolicy")}
          </a>
          <a
            href="#"
            className="text-sm font-medium text-[#C17B5C] hover:text-[#A86548] transition-colors"
          >
            {t("settings.privacy.terms")}
          </a>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/90 border border-[#E8D8CC] rounded-[2rem] p-6 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#F2E8DE] flex items-center justify-center">
            <LogOut className="w-5 h-5 text-[#C17B5C]" />
          </div>
          <h2 className="font-semibold text-[#2D2D2D]">{t("settings.session.title")}</h2>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-[2rem] text-sm font-semibold text-[#A86548] bg-white border-2 border-[#C17B5C]/40 hover:bg-[#F2E8DE]/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C17B5C] transition-colors disabled:opacity-60"
        >
          <LogOut className="w-4 h-4" />
          {signingOut ? t("settings.session.signingOut") : t("settings.session.signOut")}
        </button>
      </motion.section>
    </div>
  );
}
