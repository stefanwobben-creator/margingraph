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

/**
 * True only on a real production deploy.
 *
 * Vercel sets VERCEL_ENV on every deployment; when it is present it is
 * authoritative. Outside Vercel we fall back to NODE_ENV so a self-hosted
 * production build still behaves correctly.
 */
export const isProduction =
  process.env.VERCEL_ENV !== undefined
    ? process.env.VERCEL_ENV === "production"
    : process.env.NODE_ENV === "production";

/**
 * The commit this build came from.
 *
 * Vercel sets VERCEL_GIT_COMMIT_SHA at build time. Rendered into the page as a
 * meta tag so `npm run verify:live` can answer the question that is otherwise
 * guesswork: is what I am looking at actually my latest commit?
 */
export const buildSha = process.env.VERCEL_GIT_COMMIT_SHA ?? "local";

/**
 * Who is actually selling.
 *
 * These are the only facts on the site that cannot be worked out from the code,
 * and they are the ones a buyer is entitled to before handing over money. They
 * sit here rather than typed into the legal pages so there is exactly one place
 * to be wrong, and a test fails while they are still placeholders.
 */
export const seller = {
  legalName: "Stefan Wobben Advies",
  kvk: "70889945",
  vat: "NL001397170B41",
  email: "info@margingraph.com",
} as const;

/** True while the seller block has not been filled in with real details. */
export const sellerIsPlaceholder = Object.values(seller).some((value) =>
  value.startsWith("TODO:"),
);

export const site = {
  name: "MarginGraph",
  tagline: "Business decisions, with the evidence attached.",
  description:
    "MarginGraph makes the reasoning behind business decisions explicit, traceable and reusable.",
  url: resolveUrl(),
  locale: "en",
} as const;

export type Site = typeof site;
