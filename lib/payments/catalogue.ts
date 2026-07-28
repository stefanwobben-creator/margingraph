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
  "business-valuation": {
    slug: "business-valuation",
    price: 9,
    // Lemon Squeezy variant UUID, from Store → Products → Share → the /buy/ URL.
    variant: process.env.NEXT_PUBLIC_LS_VARIANT_BUSINESS_VALUATION ?? "",
  },
};

export function getProduct(slug: string): Product | undefined {
  return products[slug];
}

export const productSlugs = Object.keys(products);
