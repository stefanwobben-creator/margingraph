/**
 * The only file in the project that touches `gtag` directly.
 *
 * Everything else imports the typed helpers from `lib/analytics`. That keeps
 * the vendor surface to one file — if GA4 is ever replaced, this is what
 * changes and nothing else does.
 */
import { analyticsEnabled, GA_MEASUREMENT_ID } from "@/lib/analytics/config";

type GtagCommand = "js" | "config" | "event" | "consent" | "set";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (command: GtagCommand, ...args: unknown[]) => void;
  }
}

/** No-ops on the server, when disabled, and before the script has loaded. */
export function gtag(command: GtagCommand, ...args: unknown[]): void {
  if (!analyticsEnabled) return;
  if (typeof window === "undefined") return;
  window.gtag?.(command, ...args);
}

/**
 * A page view, sent explicitly.
 *
 * The gtag config sets `send_page_view: false`, so this is the only source of
 * page_view events. That is what makes duplicates impossible on the code side
 * — see the note in docs/go-live.md about the matching GA4 admin setting.
 */
export function sendPageView(path: string): void {
  if (!GA_MEASUREMENT_ID) return;
  gtag("event", "page_view", {
    page_path: path,
    page_location: typeof window !== "undefined" ? window.location.href : path,
    page_title: typeof document !== "undefined" ? document.title : undefined,
    send_to: GA_MEASUREMENT_ID,
  });
}

/** Consent Mode v2. Defaults are set to denied in the init script. */
export function updateConsent(granted: boolean): void {
  gtag("consent", "update", {
    analytics_storage: granted ? "granted" : "denied",
  });
}
