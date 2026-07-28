import localFont from "next/font/local";

import { LogoMark } from "@/components/brand/logo-mark";
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
 *
 * `<b>` is the correct element: HTML5 defines it as text stylistically offset
 * without conveying extra importance, which is exactly this. `<strong>` would
 * be wrong, and screen readers announce neither the same way.
 *
 * The explicit weight matters. Tailwind's preflight sets `b { font-weight:
 * bolder }`, which on a variable font resolves to roughly 700 relative to the
 * 450 parent — close enough to look deliberate and wrong enough to miss.
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
      Margin<b className="font-[850]">Graph</b>
    </span>
  );
}

/**
 * The lockup: mark and wordmark together.
 *
 * The mark sits at the cap height of the wordmark rather than on the baseline,
 * so the two read as one object. Use this wherever the brand appears as a
 * brand; use `Wordmark` alone where it is running text.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className="size-[1.15em] text-wordmark" />
      <Wordmark />
    </span>
  );
}
