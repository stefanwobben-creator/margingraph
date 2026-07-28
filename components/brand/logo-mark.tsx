import { cn } from "@/lib/utils";

/**
 * The MarginGraph mark.
 *
 * Three ascending bars with a gap between them: the graph, and the margin as
 * the space that separates one column from the next. The tallest carries the
 * single accent colour, which is the same restraint the rest of the design
 * system uses — one colour, used once, where it means something.
 *
 * Drawn on a 24-unit grid with 4-unit bars and 3-unit gaps so it stays on
 * whole pixels at 16, 24, 32 and 48. Below 16px the gaps close up; use the
 * wordmark alone at that size instead.
 */
export function LogoMark({
  className,
  monochrome = false,
}: {
  className?: string;
  /** Renders every bar in the current text colour — for print and favicons. */
  monochrome?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={cn("size-6 shrink-0", className)}
    >
      <rect x="1" y="13" width="4" height="10" rx="1.5" fill="currentColor" opacity="0.35" />
      <rect x="8" y="8" width="4" height="15" rx="1.5" fill="currentColor" opacity="0.6" />
      <rect
        x="15"
        y="1"
        width="4"
        height="22"
        rx="1.5"
        fill={monochrome ? "currentColor" : "var(--accent-brand)"}
      />
    </svg>
  );
}
