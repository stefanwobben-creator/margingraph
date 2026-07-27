/**
 * Single source of truth for site-level constants.
 * Imported by metadata, header, footer and (later) sitemap/robots.
 */
export const site = {
  name: "MarginGraph",
  tagline: "Business decisions, with the evidence attached.",
  description:
    "MarginGraph makes the reasoning behind business decisions explicit, traceable and reusable.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "en",
} as const;

export type Site = typeof site;
