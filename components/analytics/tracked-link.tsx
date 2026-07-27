"use client";

import Link from "next/link";

import { trackEvent } from "@/lib/analytics";

type TrackedLinkProps = Omit<React.ComponentProps<typeof Link>, "href"> & {
  href: string;
  /**
   * Falls back to the decision slug in the current URL. That matters for the
   * call to action on a decision page itself, whose href points at the
   * checkout rather than at the report.
   */
  reportSlug?: string;
  location?: string;
};

/** Reads the decision slug out of a path, e.g. /decision/cash-runway. */
function slugFromPath(path: string): string | undefined {
  return path.split("/decision/")[1]?.split(/[/?#]/)[0] || undefined;
}

/**
 * A report call to action that reports its own click.
 *
 * Exists so server components — which is nearly everything here — can attach
 * tracking without becoming client components. The event is fixed rather than
 * configurable, so this cannot quietly become a generic untyped escape hatch.
 */
export function TrackedLink({
  href,
  reportSlug,
  location = "content",
  onClick,
  ...props
}: TrackedLinkProps) {
  return (
    <Link
      {...props}
      href={href}
      onClick={(event) => {
        const slug =
          reportSlug ??
          slugFromPath(href) ??
          (typeof window !== "undefined"
            ? slugFromPath(window.location.pathname)
            : undefined);

        trackEvent("generate_report_clicked", {
          report_slug: slug ?? "unknown",
          location,
        });
        onClick?.(event);
      }}
    />
  );
}
