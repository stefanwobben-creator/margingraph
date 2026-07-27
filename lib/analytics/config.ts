/**
 * Analytics configuration. The single source of truth for whether tracking
 * exists at all.
 *
 * The measurement ID is read from the environment in exactly one place. It is
 * never hardcoded, never duplicated, and never inlined at a call site.
 */
import { isProduction } from "@/lib/site";

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

/**
 * Tracking runs only when both conditions hold:
 *
 * - a measurement ID is configured, and
 * - this is a real production deploy.
 *
 * Local development and preview deployments therefore send nothing, without
 * anyone needing to remember to unset a variable.
 */
export const analyticsEnabled = Boolean(GA_MEASUREMENT_ID) && isProduction;

/**
 * Where a granted consent decision is remembered between visits. A consent
 * banner writes it; the analytics module reads it on load.
 */
export const CONSENT_STORAGE_KEY = "mg-analytics-consent";
