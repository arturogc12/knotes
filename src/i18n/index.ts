import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { LOCALE_STORAGE_KEY, type Locale } from "../types/settings";
import es from "./locales/es.json";
import en from "./locales/en.json";

function getStoredLocale(): Locale {
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (stored === "es" || stored === "en") return stored;
  return "es";
}

void i18n.use(initReactI18next).init({
  resources: {
    es: { translation: es },
    en: { translation: en },
  },
  lng: getStoredLocale(),
  fallbackLng: "es",
  interpolation: { escapeValue: false },
});

export function setLocale(locale: Locale) {
  localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  void i18n.changeLanguage(locale);
}

export default i18n;
