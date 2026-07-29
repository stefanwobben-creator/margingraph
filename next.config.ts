import type { NextConfig } from "next";

/**
 * Content Security Policy.
 *
 * The site is entirely static and loads nothing from a third party, so this can
 * be tight. Two deliberate relaxations:
 *
 * - `'unsafe-inline'` on style-src: Next injects critical CSS inline and
 *   next/font writes inline font-face rules.
 * - `'unsafe-inline'` on script-src: Next's bootstrap script is inline.
 *
 * Removing either requires per-request nonces, which requires middleware, which
 * makes every response dynamic — a poor trade for a fully static site. If an
 * analytics or embed script is ever added, its origin must be listed here or it
 * will be blocked, which is the intended behaviour.
 */
/**
 * Google Analytics origins, added only when a measurement ID is configured.
 *
 * Without these the browser blocks gtag silently — the failure mode is an
 * analytics property that simply never receives data, with nothing in the
 * application logs to explain it. Sites with no measurement ID keep the
 * tighter policy.
 */
const gaEnabled = Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);

const gaScriptSrc = gaEnabled ? " https://www.googletagmanager.com" : "";
const gaConnectSrc = gaEnabled
  ? " https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com"
  : "";
const gaImgSrc = gaEnabled
  ? " https://www.google-analytics.com https://www.googletagmanager.com"
  : "";

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${gaScriptSrc}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob:${gaImgSrc}`,
  "font-src 'self' data:",
  `connect-src 'self'${gaConnectSrc}`,
  // The Video component embeds youtube-nocookie and vimeo; nothing else.
  "frame-src 'self' https://www.youtube-nocookie.com https://player.vimeo.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Redundant with frame-ancestors, but understood by older browsers.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  // Stops advertising the framework and version in every response.
  poweredByHeader: false,

  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        source: "/(sitemap.xml|robots.txt)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, s-maxage=86400",
          },
        ],
      },
    ];
  },

  /**
   * /reports was published before decisions became the only commercial content
   * type. These are permanent: the URLs were live, and a 301 preserves whatever
   * link equity and bookmarks they picked up.
   *
   * The Dutch pages are the same problem with a worse cause. The site was
   * written in two languages, one was chosen, and the Dutch versions were
   * removed from the working copy without ever being removed from the
   * repository, so they went on being built and served: five pages, four of
   * them near-duplicates of an English page, on one domain, with nothing
   * telling a search engine which was which. Each one now points at its
   * English twin.
   */
  async redirects() {
    return [
      // Reversed. /reports was the redirect and /decision was the page; the
      // header said Reports, the footer said Decisions and the URL said
      // /decision, which is three names for one product. /reports is the page
      // now and everything else points at it.
      { source: "/decision", destination: "/reports", permanent: true },
      {
        source: "/decision/:slug",
        destination: "/reports/:slug",
        permanent: true,
      },
      { source: "/decision/category/:slug", destination: "/reports/category/:slug", permanent: true },
      // Blog and guides were the same thing with two labels.
      { source: "/blog", destination: "/guides", permanent: true },
      { source: "/blog/:slug", destination: "/guides/:slug", permanent: true },
      { source: "/blog/category/:slug", destination: "/guides/category/:slug", permanent: true },
      // Both halves of the flow now live on the report they describe.
      {
        source: "/what-we-find",
        destination: "/reports/what-is-hiding-in-my-figures",
        permanent: true,
      },
      {
        source: "/decision/wat-zit-er-in-mijn-cijfers",
        destination: "/decision/what-is-hiding-in-my-figures",
        permanent: true,
      },
      {
        source: "/blog/omzet-daalt-kosten-niet-hoe-zie-je-dat-op-tijd",
        destination: "/blog/revenue-fell-costs-did-not",
        permanent: true,
      },
      {
        source: "/blog/vracht-doorbelasten-hoeveel-is-normaal",
        destination: "/blog/how-much-freight-are-you-giving-away",
        permanent: true,
      },
      {
        source: "/blog/waarom-telt-mijn-winst-en-verliesrekening-niet-op",
        destination: "/blog/why-your-profit-and-loss-does-not-add-up",
        permanent: true,
      },
      // No English twin: this one was an anonymised read of a real information
      // memorandum and was never rewritten. The index is the honest landing
      // place until it is.
      {
        source: "/blog/informatiememorandum-lezen-de-ene-deling",
        destination: "/blog",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
