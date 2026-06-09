const STORAGE_PREFIX = "knotes:pwa-welcome-seen:";

export type PwaPlatform = "ios" | "android";

function storageKey(userId: string) {
  return `${STORAGE_PREFIX}${userId}`;
}

export function hasSeenPwaWelcome(userId: string): boolean {
  const key = storageKey(userId);
  try {
    if (sessionStorage.getItem(key) === "1") return true;
    return localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

export function markPwaWelcomeSeen(userId: string): void {
  const key = storageKey(userId);
  try {
    sessionStorage.setItem(key, "1");
    localStorage.setItem(key, "1");
  } catch {
    // ignore quota / private mode
  }
}

export function detectDefaultPlatform(): PwaPlatform {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "ios";
}
