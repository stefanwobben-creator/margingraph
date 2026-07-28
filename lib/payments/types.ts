/**
 * The payment provider contract.
 *
 * Lemon Squeezy is being folded into Stripe Managed Payments (announced by
 * Lemon Squeezy on 28 January 2026, no end date given). Everything
 * provider-specific therefore lives behind this interface, so replacing the
 * provider is one new file and one line in `index.ts` rather than a hunt
 * through the application.
 */

/** A thing that can be bought. One per decision report. */
export type Product = {
  /** The decision slug. Must match a file in /content/decisions. */
  slug: string;
  /** Price in euros, for display and for the analytics value. */
  price: number;
  /** Provider-side identifier. For Lemon Squeezy this is the variant UUID. */
  variant: string;
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
