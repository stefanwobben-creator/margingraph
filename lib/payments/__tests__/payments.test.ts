import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { buildCheckoutUrl } from "../lemonsqueezy.ts";
import { PaymentConfigError, type Product } from "../types.ts";

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
