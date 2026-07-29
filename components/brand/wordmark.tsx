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
 * All caps, MARGIN at 850 and GRAPH at 450. The weight contrast is the mark
 * itself, and it falls on the half of the name that is the product: margin is
 * what the customer is buying, the graph is only how it is drawn. The earlier
 * version had the emphasis the other way round and quietly sold the packaging.
 *
 * The tracking is positive here where it was negative in the mixed-case
 * version. Capitals have no descenders or ascenders to separate them, so the
 * same negative tracking that tightens lowercase turns caps into a wall.
 *
 * `<b>` is the correct element: HTML5 defines it as text stylistically offset
 * without conveying extra importance, which is exactly this. `<strong>` would
 * be wrong, and screen readers announce neither the same way.
 *
 * The explicit weight matters. Tailwind's preflight sets `b { font-weight:
 * bolder }`, which on a variable font resolves to roughly 700 relative to the
 * 450 parent: close enough to look deliberate and wrong enough to miss.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        wordmarkFont.className,
        "font-[450] tracking-[0.04em] whitespace-nowrap text-wordmark uppercase",
        className,
      )}
    >
      <b className="font-[850]">Margin</b>Graph
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
