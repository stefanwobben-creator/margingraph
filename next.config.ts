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
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
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
   */
  async redirects() {
    return [
      { source: "/reports", destination: "/decision", permanent: true },
      {
        source: "/reports/:slug",
        destination: "/decision/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
