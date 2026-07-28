import {
  PaymentConfigError,
  type CheckoutRequest,
  type PaymentProvider,
} from "@/lib/payments/types";

/**
 * Lemon Squeezy, as merchant of record.
 *
 * They are the legal seller, which means they handle EU VAT. We hand off with
 * a hosted checkout URL rather than an embedded form: no card data touches
 * this application, and there is nothing to get wrong in PCI terms.
 *
 * Attribution rides along in `checkout[custom][...]`, which Lemon Squeezy
 * stores on the order and returns through their API. That removes the need
 * for a database on our side: the answer to "which page sold this" lives with
 * the order itself.
 */
const STORE = process.env.NEXT_PUBLIC_LS_STORE ?? "";

/** Lemon Squeezy silently drops custom keys that are not plain snake_case. */
const CUSTOM_KEY = /^[a-z][a-z0-9_]*$/;

export function buildCheckoutUrl(
  store: string,
  request: CheckoutRequest,
): string {
  if (!store) {
    throw new PaymentConfigError(
      "NEXT_PUBLIC_LS_STORE is not set, so no checkout URL can be built",
    );
  }
  if (!request.product.variant) {
    throw new PaymentConfigError(
      `product "${request.product.slug}" has no Lemon Squeezy variant configured`,
    );
  }

  const url = new URL(
    `https://${store}.lemonsqueezy.com/checkout/buy/${request.product.variant}`,
  );

  const custom: Record<string, string> = { report: request.product.slug };
  if (request.sourcePath) custom.source_path = request.sourcePath;

  for (const [key, value] of Object.entries(custom)) {
    if (!CUSTOM_KEY.test(key)) {
      throw new PaymentConfigError(`custom key "${key}" is not snake_case`);
    }
    url.searchParams.set(`checkout[custom][${key}]`, value);
  }

  return url.toString();
}

export const lemonSqueezy: PaymentProvider = {
  id: "lemonsqueezy",
  isConfigured: () => Boolean(STORE),
  checkoutUrl: (request) => buildCheckoutUrl(STORE, request),
};
