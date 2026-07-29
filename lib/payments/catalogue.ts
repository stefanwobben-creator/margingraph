import type { Product } from "@/lib/payments/types";

/**
 * Everything that can be sold, in one place.
 *
 * A decision page without an entry here cannot render a working buy button,
 * and the test suite fails rather than shipping a page that takes no money.
 * That is deliberate: a broken checkout is invisible until someone tries to
 * pay, and by then you have lost the customer and will never know.
 */
export const products: Record<string, Product> = {
  /**
   * Three reports off one file, at €21 rather than €27.
   *
   * A separate Mollie link rather than a quantity field, because a payment
   * link with a fixed amount cannot be edited by whoever opens it and a
   * checkout that can be edited by the buyer is a checkout that will be.
   */
  bundle: {
    slug: "bundle",
    price: 21,
    checkout: (process.env.NEXT_PUBLIC_MOLLIE_LINK_BUNDLE ?? "").trim(),
  },
  "business-valuation": {
    slug: "business-valuation",
    price: 9,
    // The whole Mollie payment link, from Dashboard → Payment links → a
    // reusable link with the amount set to €9. Trimmed for the same reason as
    // before: pasted by hand into a dashboard, and a trailing space survives
    // the paste.
    checkout: (
      process.env.NEXT_PUBLIC_MOLLIE_LINK_BUSINESS_VALUATION ?? ""
    ).trim(),
  },
};

export function getProduct(slug: string): Product | undefined {
  return products[slug];
}

export const productSlugs = Object.keys(products);
