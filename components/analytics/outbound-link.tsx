"use client";

import { trackEvent } from "@/lib/analytics";

/**
 * External link with click tracking. Used by the MDX `a` override, so every
 * outbound link in 60-odd content files is measured without an author doing
 * anything.
 */
export function OutboundLink({
  href,
  children,
  ...props
}: React.ComponentProps<"a"> & { href: string }) {
  return (
    <a
      {...props}
      href={href}
      rel="noopener noreferrer"
      target="_blank"
      onClick={() =>
        trackEvent("outbound_link_clicked", {
          url: href,
          label: typeof children === "string" ? children : undefined,
        })
      }
    >
      {children}
    </a>
  );
}
