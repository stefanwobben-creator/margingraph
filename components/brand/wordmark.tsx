import localFont from "next/font/local";

import { cn } from "@/lib/utils";

/**
 * Zalando Sans Expanded, self-hosted.
 *
 * `next/font/local` inlines the @font-face at build time, emits a preload link
 * and scopes the family to a generated class name. None of that is possible
 * with an @import from a CDN, and the CDN version would be blocked by the
 * Content-Security-Policy anyway.
 *
 * One variable file covers both weights. The range is declared rather than a
 * single value, or the browser would synthesise a fake bold instead of using
 * the real 850 position on the weight axis.
 */
const wordmarkFont = localFont({
  src: "../../app/fonts/zalando-sans-expanded-latin.woff2",
  weight: "450 850",
  style: "normal",
  display: "swap",
  variable: "--font-wordmark",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

/**
 * The MarginGraph wordmark.
 *
 * "Margin" at 450, "Graph" at 850 — the weight contrast is the mark itself.
 * Expressed as two spans rather than a `<b>`, which would tell a screen reader
 * that the second half of a company name is more important than the first.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        wordmarkFont.className,
        "font-[450] tracking-[-0.02em] whitespace-nowrap text-wordmark",
        className,
      )}
    >
      Margin<span className="font-[850]">Graph</span>
    </span>
  );
}
