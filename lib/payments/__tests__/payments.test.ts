import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { buildCheckoutUrl } from "../mollie";
import { PaymentConfigError, type Product } from "../types";

const product: Product = {
  slug: "business-valuation",
  price: 9,
  checkout: "https://payment-links.mollie.com/payment/abcd1234",
};

describe("checkout url", () => {
  it("sends the buyer to the payment link exactly as Mollie wrote it", () => {
    const url = new URL(buildCheckoutUrl({ product }));
    expect(url.origin).toBe("https://payment-links.mollie.com");
    expect(url.pathname).toBe("/payment/abcd1234");
    // Mollie payment links carry no custom metadata. Adding query parameters
    // to someone else's URL in the hope they are ignored is how a checkout
    // breaks silently, so the source page is not smuggled in here.
    expect([...url.searchParams.keys()]).toEqual([]);
  });

  it("leaves the URL alone when a source page is supplied", () => {
    const plain = buildCheckoutUrl({ product });
    expect(buildCheckoutUrl({ product, sourcePath: "/guides/x" })).toBe(plain);
  });

  it("names the product instead of throwing Invalid URL", () => {
    const blank = { product: { ...product, checkout: "" } };
    expect(() => buildCheckoutUrl(blank)).toThrow(PaymentConfigError);
    expect(() => buildCheckoutUrl(blank)).toThrow(/business-valuation/);
    expect(() =>
      buildCheckoutUrl({ product: { ...product, checkout: "payment-links.mollie.com/x" } }),
    ).toThrow(/not a URL/);
  });

  // The failure that matters is not a broken link. It is a working link to
  // somewhere else: the buy button is the one element on the site where a
  // wrong hostname takes money off the customer and gives us nothing.
  it("refuses to point a buy button at anything that is not Mollie", () => {
    for (const bad of [
      "https://mollie.com.example.net/payment/abcd",
      "http://payment-links.mollie.com/payment/abcd",
      "https://notmollie.com/payment/abcd",
    ]) {
      expect(() => buildCheckoutUrl({ product: { ...product, checkout: bad } })).toThrow(
        PaymentConfigError,
      );
    }
  });

  it("tolerates the whitespace a paste leaves behind", () => {
    const padded = { ...product, checkout: ` ${product.checkout} ` };
    expect(buildCheckoutUrl({ product: padded })).toBe(product.checkout);
  });
});

describe("no decision page can ship without a working checkout", () => {
  const dir = join(process.cwd(), "content", "reports");

  it("has no placeholder links left in any decision page", () => {
    const offenders = readdirSync(dir)
      .filter((f) => f.endsWith(".mdx"))
      .filter((f) => readFileSync(join(dir, f), "utf8").includes('href="#"'));
    expect(
      offenders,
      `these decision pages still link to "#" and cannot take money`,
    ).toEqual([]);
  });
});

describe("the buy button survives every way a link gets opened", () => {
  const source = readFileSync(
    join(process.cwd(), "components", "commerce", "checkout-link.tsx"),
    "utf8",
  );

  // cmd-click, middle click, "open in new tab" and "copy link address" either
  // skip the React click handler or run it too late to matter. Whatever sits
  // in the href attribute at render time is where the buyer actually lands, so
  // it has to be a real checkout URL rather than an internal placeholder.
  it("renders a real checkout URL rather than an internal placeholder", () => {
    expect(source).not.toMatch(/href="\/[^"]*"/);
    expect(source).toContain("payments.checkoutUrl({ product })");
  });
});
