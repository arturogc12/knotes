import { shouldShowPwaWelcome } from "./pwaWelcome";

export const PUBLIC_MARKETING_ROUTES = ["/", "/login", "/profesionales"] as const;

export type PublicMarketingRoute = (typeof PUBLIC_MARKETING_ROUTES)[number];

export function getPostAuthDestination(userId: string): "/bienvenida" | "/chat" {
  return shouldShowPwaWelcome(userId) ? "/bienvenida" : "/chat";
}

export function isPublicMarketingRoute(pathname: string): pathname is PublicMarketingRoute {
  return (PUBLIC_MARKETING_ROUTES as readonly string[]).includes(pathname);
}
