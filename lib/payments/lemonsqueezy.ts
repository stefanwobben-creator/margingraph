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
/**
 * Trimmed, because these values are pasted into a dashboard by a human and a
 * trailing space survives the paste. One did: the store arrived as
 * `"higher-ground "`, which produced `https://higher-ground .lemonsqueezy.com`
 * and a bare `TypeError: Invalid URL` with no clue as to which of the two
 * variables was wrong. Whitespace is never meaningful here, so remove it and
 * say something useful about whatever is left.
 */
const STORE = (process.env.NEXT_PUBLIC_LS_STORE ?? "").trim();

/** Lemon Squeezy silently drops custom keys that are not plain snake_case. */
const CUSTOM_KEY = /^[a-z][a-z0-9_]*$/;

/** A store name is the subdomain, so it obeys hostname label rules. */
const STORE_NAME = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/i;

export function buildCheckoutUrl(
  store: string,
  request: CheckoutRequest,
): string {
  if (!store) {
    throw new PaymentConfigError(
      "NEXT_PUBLIC_LS_STORE is not set, so no checkout URL can be built",
    );
  }
  if (!STORE_NAME.test(store)) {
    throw new PaymentConfigError(
      `NEXT_PUBLIC_LS_STORE is ${JSON.stringify(store)}, which is not a store ` +
        `name. It should be just the subdomain, as in "higher-ground" for ` +
        `https://higher-ground.lemonsqueezy.com, with no protocol, no dots ` +
        `and no spaces.`,
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
  // A malformed store is not the same as an absent one. Absent is a preview
  // build without secrets, and the button says so. Malformed is a mistake in
  // the dashboard, and `checkoutUrl` throws with the value in the message so
  // the build fails on the deploy that introduced it rather than shipping.
  isConfigured: () => Boolean(STORE),
  checkoutUrl: (request) => buildCheckoutUrl(STORE, request),
};
