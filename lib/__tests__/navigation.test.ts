import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { collectionList } from "@/lib/content/collections";
import { routes } from "@/lib/routes";
import { sellerIsPlaceholder } from "@/lib/site";

const read = (...parts: string[]) =>
  readFileSync(join(process.cwd(), ...parts), "utf8");

/** Decisions are labelled "Reports" in the chrome. Everything else matches. */
function routeKey(id: string): string {
  return id === "decisions" ? "reports" : id;
}

describe("navigation reaches every collection", () => {
  // `routes.guides` pointed at `/blog` for as long as both existed, so the
  // header read "Guides" and went somewhere else. Nothing caught it, because
  // both were valid URLs and the page it landed on looked plausible.
  it("points each route at its own collection", () => {
    expect(routes.guides).toBe("/guides");
    expect(routes.blog).toBe("/blog");
    expect(routes.faq).toBe("/faq");
    expect(routes.reports).toBe("/decision");
  });

  it("links every collection from the header, and builds the footer from the registry", () => {
    const header = read("components", "layout", "site-header.tsx");
    const missing = collectionList
      .map((collection) => collection.id)
      .filter((id) => !header.includes(`routes.${routeKey(id)}`));

    expect(missing, "collections with no header link").toEqual([]);
    expect(read("components", "layout", "site-footer.tsx")).toContain(
      "collectionList",
    );
  });

  // On-page anchors have to be root-absolute or they resolve against whatever
  // page the visitor is on: silently correct on the homepage, dead elsewhere.
  it("keeps homepage anchors root-absolute", () => {
    expect(routes.howItWorks.startsWith("/#")).toBe(true);
  });

  // The example is a generated page now, not a section of the homepage.
  it("points the example report at a page of its own", () => {
    expect(routes.exampleReport).toBe("/example-report");
  });
});

describe("the flow page", () => {
  // How it works used to be `#how-it-works`, an anchor that resolved against
  // whatever page you happened to be on. It is now a page that renders both
  // halves of the flow from the shipped engine.
  it("is linked from the header", () => {
    expect(read("components", "layout", "site-header.tsx")).toContain(
      "routes.whatWeFind",
    );
  });

  it("is a real path, so it works from anywhere on the site", () => {
    expect(routes.whatWeFind).toBe("/what-we-find");
    expect(routes.whatWeFind).not.toContain("#");
  });

  it("has a page file behind it", () => {
    expect(read("app", "what-we-find", "page.tsx")).toContain("demoTeaser");
  });
});

describe("the legal pages", () => {
  // A terms page naming a company that does not exist is worse than no terms
  // page: the first is a misrepresentation, the second is only a gap. So the
  // build goes red while the seller block is still placeholders.
  it("cannot go live with placeholder seller details", () => {
    expect(
      sellerIsPlaceholder,
      "fill in `seller` in lib/site.ts: legal name, KvK, VAT and a business email",
    ).toBe(false);
  });

  it("is linked from the footer, where people look for it", () => {
    const footer = read("components", "layout", "site-footer.tsx");
    expect(footer).toContain("/terms");
    expect(footer).toContain("/privacy");
  });
});

describe("the intake", () => {
  // Every call to action used to end on a browse list. A visitor who has
  // decided has to be able to act in one click, not two.
  it("is where the hero sends people", () => {
    expect(read("components", "sections", "hero.tsx")).toContain("routes.send");
  });

  it("is in the header, and is a page rather than a mailto", () => {
    expect(read("components", "layout", "site-header.tsx")).toContain("routes.send");
    expect(routes.send).toBe("/send");
  });

  it("names the business address, never a personal one", () => {
    const page = read("app", "send", "page.tsx");
    expect(page).toContain("seller.email");
    expect(page).not.toMatch(/@gmail\.com/);
  });

  it("has a page for the payment provider to return to", () => {
    expect(read("app", "thanks", "page.tsx")).toContain("on its way");
  });
});
