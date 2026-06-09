export type SubscriptionPlan = "free" | "premium";

export type Locale = "es" | "en";

export const LOCALE_STORAGE_KEY = "knotes-locale";

export const PLACEHOLDER_SUBSCRIPTION: {
  plan: SubscriptionPlan;
  renewsAt: string | null;
} = {
  plan: "free",
  renewsAt: null,
};
