/**
 * The payment provider contract.
 *
 * Written while the provider was Lemon Squeezy, on the argument that they were
 * being folded into Stripe Managed Payments and would not be the provider
 * forever. They stopped being the provider sooner than that and for an
 * unrelated reason, and the swap cost one new file and one line in `index.ts`.
 * Everything provider-specific stays behind this interface.
 */

/** A thing that can be bought. One per decision report. */
export type Product = {
  /** The decision slug. Must match a file in /content/decisions. */
  slug: string;
  /**
   * Price in euros, including VAT.
   *
   * Inclusive because we are the seller of record now rather than the payment
   * provider, and a price shown to a consumer in the EU includes the tax.
   */
  price: number;
  /**
   * Whatever the provider needs to identify this purchase.
   *
   * For Mollie it is the whole payment link. For a provider with a product
   * catalogue of its own it would be an id. Deliberately opaque here: the
   * moment this type knows what shape the string is, the interface has leaked.
   */
  checkout: string;
};

export type CheckoutRequest = {
  product: Product;
  /**
   * The path the buyer clicked from, e.g. "/guides/profitable-and-broke".
   *
   * Read from the current URL at click time. Nothing is stored on the
   * visitor's device, so this needs no consent: it is a value in a link, not
   * a cookie and not a tracker.
   */
  sourcePath?: string;
};

export interface PaymentProvider {
  readonly id: string;
  /** False when the environment is missing, so the UI can fail visibly. */
  isConfigured(): boolean;
  /** The URL a buyer is sent to. Pure: no network, no side effects. */
  checkoutUrl(request: CheckoutRequest): string;
}

export class PaymentConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaymentConfigError";
  }
}
