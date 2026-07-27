/**
 * Site-level constants. The single source for canonical URLs, feed metadata
 * and structured data.
 */

/**
 * Resolution order matters. Without the Vercel fallback, a deploy that forgets
 * NEXT_PUBLIC_SITE_URL silently publishes a sitemap, canonicals and JSON-LD
 * that all point at localhost — the kind of mistake that is invisible until
 * indexing has already gone wrong.
 */
function resolveUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}

export const site = {
  name: "MarginGraph",
  tagline: "Business decisions, with the evidence attached.",
  description:
    "MarginGraph makes the reasoning behind business decisions explicit, traceable and reusable.",
  url: resolveUrl(),
  locale: "en",
} as const;

export type Site = typeof site;
