import {
  PaymentConfigError,
  type CheckoutRequest,
  type PaymentProvider,
} from "@/lib/payments/types";

/**
 * Mollie, with us as the seller.
 *
 * The reason for the switch is one payment method. Lemon Squeezy takes cards,
 * PayPal, Apple Pay, Google Pay, Alipay, WeChat Pay, Cash App and ACH, and no
 * iDEAL or Wero. Around two thirds of Dutch online payments go through that
 * one button, and a Dutch owner asked to type a card number for €9 mostly does
 * not. No amount of copywriting recovers a checkout that lacks the method the
 * buyer expects.
 *
 * The cost happens to fall too. On a €9 sale Lemon Squeezy takes 5% + $0.50,
 * around €0.88, which is nearly a tenth of the price. iDEAL and Wero through
 * Mollie are €0.32 flat.
 *
 * What we give up is the merchant of record. Lemon Squeezy were the legal
 * seller and handled EU VAT; with Mollie we are the seller, so the price shown
 * has to include VAT and the return goes on our own filing. That is a monthly
 * bookkeeping line, not an engineering problem, and it is the right trade for
 * the button.
 *
 * There is no store-level identifier here and no variant. A Mollie payment
 * link is a complete URL created once in the dashboard, reusable, with the
 * amount fixed on it, so the whole configuration is the link itself.
 */

/** Payment links live on Mollie's own domains. Anything else is a mistake. */
const MOLLIE_HOST = /(^|\.)mollie\.com$/i;

export function buildCheckoutUrl(request: CheckoutRequest): string {
  const link = request.product.checkout.trim();

  if (!link) {
    throw new PaymentConfigError(
      `product "${request.product.slug}" has no Mollie payment link configured`,
    );
  }

  let url: URL;
  try {
    url = new URL(link);
  } catch {
    throw new PaymentConfigError(
      `the Mollie payment link for "${request.product.slug}" is ${JSON.stringify(link)}, ` +
        `which is not a URL. Paste the whole link from Mollie, starting with https://`,
    );
  }

  if (url.protocol !== "https:" || !MOLLIE_HOST.test(url.hostname)) {
    throw new PaymentConfigError(
      `the Mollie payment link for "${request.product.slug}" points at ${url.origin}, ` +
        `which is not Mollie. A buy button pointing anywhere else is how a shop ` +
        `sends its customers to a stranger.`,
    );
  }

  // Deliberately no query parameters. Mollie payment links carry no custom
  // metadata, and adding parameters to somebody else's URL on the hope that
  // they are ignored is how a checkout breaks silently. Attribution is kept
  // instead in the click event, which is where it was always read from.
  return url.toString();
}

export const mollie: PaymentProvider = {
  id: "mollie",
  // Nothing to configure at the account level: a payment link is either on the
  // product or it is not, and `checkoutUrl` says which product is missing one.
  isConfigured: () => true,
  checkoutUrl: buildCheckoutUrl,
};
