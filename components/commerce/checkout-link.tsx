"use client";

import { useCallback } from "react";

import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import { getProduct, payments } from "@/lib/payments";

/**
 * The buy button.
 *
 * The source path is read from `window.location.pathname` at the moment of the
 * click. Nothing is written to the visitor's device: no cookie, no
 * localStorage, no sessionStorage. That keeps attribution outside the scope of
 * the consent rules, at the cost of only knowing the last page rather than the
 * first. For a ten-minute read that is a real limitation, and it is the honest
 * trade for not needing a banner.
 */
export function CheckoutLink({
  report,
  label,
  location,
}: {
  report: string;
  label?: string;
  location?: string;
}) {
  const product = getProduct(report);

  const onClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (!product) return;
      trackEvent("generate_report_clicked", {
        report_slug: product.slug,
        location,
        price: product.price,
      });
      // Built here rather than at render time so the path is the page the
      // visitor is actually on, including when they arrived by client-side
      // navigation.
      event.currentTarget.href = payments.checkoutUrl({
        product,
        sourcePath: window.location.pathname,
      });
    },
    [product, location],
  );

  if (!product || !payments.isConfigured() || !product.variant) {
    // Visible failure. A silently dead buy button is the most expensive bug a
    // shop can have, because nothing in the logs says a sale did not happen.
    return (
      <span role="alert" className="text-sm text-red-600">
        Checkout is not configured for “{report}”.
      </span>
    );
  }

  return (
    <Button asChild>
      <a href="/checkout-unavailable" onClick={onClick} rel="nofollow">
        {label ?? `Generate report — €${product.price}`}
      </a>
    </Button>
  );
}
