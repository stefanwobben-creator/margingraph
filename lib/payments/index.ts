/**
 * The one import site for payments. Swapping providers happens here.
 */
import { lemonSqueezy } from "@/lib/payments/lemonsqueezy";
import type { PaymentProvider } from "@/lib/payments/types";

export const payments: PaymentProvider = lemonSqueezy;

export { getProduct, products, productSlugs } from "@/lib/payments/catalogue";
export type { Product, CheckoutRequest } from "@/lib/payments/types";
