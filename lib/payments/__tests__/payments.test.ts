import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { buildCheckoutUrl } from "../lemonsqueezy";
import { PaymentConfigError, type Product } from "../types";

const product: Product = {
  slug: "business-valuation",
  price: 9,
  variant: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
};

describe("checkout url", () => {
  it("carries the report and the source page as custom data", () => {
    const url = new URL(
      buildCheckoutUrl("margingraph", {
        product,
        sourcePath: "/guides/profitable-and-broke",
      }),
    );
    expect(url.host).toBe("margingraph.lemonsqueezy.com");
    expect(url.pathname).toBe(`/checkout/buy/${product.variant}`);
    expect(url.searchParams.get("checkout[custom][report]")).toBe(
      "business-valuation",
    );
    expect(url.searchParams.get("checkout[custom][source_path]")).toBe(
      "/guides/profitable-and-broke",
    );
  });

  it("omits the source page rather than sending an empty one", () => {
    const url = new URL(buildCheckoutUrl("margingraph", { product }));
    expect(url.searchParams.has("checkout[custom][source_path]")).toBe(false);
  });

  // A trailing space in the Vercel dashboard produced
  // `https://higher-ground .lemonsqueezy.com/...` and a bare
  // `TypeError: Invalid URL` that named neither variable.
  it("names the offending variable instead of throwing Invalid URL", () => {
    expect(() => buildCheckoutUrl("higher-ground ", { product })).toThrow(
      PaymentConfigError,
    );
    expect(() => buildCheckoutUrl("higher-ground ", { product })).toThrow(
      /NEXT_PUBLIC_LS_STORE/,
    );
    expect(() =>
      buildCheckoutUrl("https://higher-ground.lemonsqueezy.com", { product }),
    ).toThrow(PaymentConfigError);
  });

  it("refuses to build a URL without a store or a variant", () => {
    expect(() => buildCheckoutUrl("", { product })).toThrow(PaymentConfigError);
    expect(() =>
      buildCheckoutUrl("margingraph", {
        product: { ...product, variant: "" },
      }),
    ).toThrow(PaymentConfigError);
  });
});

describe("no decision page can ship without a working checkout", () => {
  const dir = join(process.cwd(), "content", "decisions");

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
