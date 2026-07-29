/**
 * The one import site for payments. Swapping providers happens here.
 *
 * It has now happened once, from Lemon Squeezy to Mollie, and the change was
 * this line plus one new file. That is the whole argument for the interface.
 */
import { mollie } from "@/lib/payments/mollie";
import type { PaymentProvider } from "@/lib/payments/types";

export const payments: PaymentProvider = mollie;

export { getProduct, products, productSlugs } from "@/lib/payments/catalogue";
export type { Product, CheckoutRequest } from "@/lib/payments/types";
