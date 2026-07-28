import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { collectionList } from "@/lib/content/collections";
import { routes } from "@/lib/routes";

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
    expect(routes.exampleReport.startsWith("/#")).toBe(true);
  });
});
