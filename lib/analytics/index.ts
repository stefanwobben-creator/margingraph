/**
 * Public analytics API.
 *
 * Import from here and nowhere else. There are no inline `gtag()` calls
 * anywhere in the application.
 */
import { CONSENT_STORAGE_KEY, analyticsEnabled } from "@/lib/analytics/config";
import { gtag, sendPageView, updateConsent } from "@/lib/analytics/gtag";
import type {
  AnalyticsEvents,
  OptionalParamEvent,
  RequiredParamEvent,
} from "@/lib/analytics/events";

export type { AnalyticsEvents, AnalyticsEventName } from "@/lib/analytics/events";
export { analyticsEnabled } from "@/lib/analytics/config";

/**
 * Send a typed event.
 *
 * The overloads make the parameter object required exactly when the event has
 * a required property, so `trackEvent("login")` compiles and
 * `trackEvent("outbound_link_clicked")` does not.
 */
export function trackEvent<K extends OptionalParamEvent>(
  name: K,
  params?: AnalyticsEvents[K],
): void;
export function trackEvent<K extends RequiredParamEvent>(
  name: K,
  params: AnalyticsEvents[K],
): void;
export function trackEvent(
  name: string,
  params: Record<string, unknown> = {},
): void {
  gtag("event", name, params);
}

export { sendPageView as trackPageView };

/* -------------------------------------------------------------------------- */
/* Consent                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Grant or withdraw analytics consent, and remember the decision.
 *
 * Nothing in this repository calls it yet — there is no consent banner. Until
 * something does, Consent Mode keeps `analytics_storage` denied, which means
 * no cookies are set and GA4 receives only cookieless pings.
 *
 * A banner is the only piece missing: call this with the user's answer.
 */
export function setAnalyticsConsent(granted: boolean): void {
  if (!analyticsEnabled || typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      CONSENT_STORAGE_KEY,
      granted ? "granted" : "denied",
    );
  } catch {
    // Private browsing modes can refuse localStorage. Consent still applies to
    // this page load; it simply will not be remembered.
  }
  updateConsent(granted);
}

/** Reads a previously stored decision. Used to re-apply consent on load. */
export function getStoredConsent(): boolean | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (value === "granted") return true;
    if (value === "denied") return false;
    return null;
  } catch {
    return null;
  }
}
