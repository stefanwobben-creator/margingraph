import type { CollectionId } from "@/lib/content/types";

export type Collection = {
  id: CollectionId;
  /** Folder under /content. */
  dir: CollectionId;
  /** URL prefix. Deliberately singular for decisions — it reads better. */
  basePath: string;
  /** Plural label for headings and breadcrumbs. */
  label: string;
  /** Singular label, used in JSON-LD and prose. */
  labelSingular: string;
  /** Index page copy. */
  title: string;
  description: string;
  /** schema.org @type for individual documents. */
  schemaType: "Article" | "TechArticle" | "WebPage";
  /** Whether to generate /{basePath}/category/{category} pages. */
  categoryPages: boolean;
  /** Whether documents appear in the RSS feed. */
  inFeed: boolean;
  /** Order in navigation and sitemap. */
  order: number;
};

/**
 * The registry. Adding a content type is one entry here plus one route file
 * that calls `createCollectionRoutes(...)` — nothing else changes.
 *
 * Three types, not four. Blog and guides were the same thing wearing two
 * labels: both were educational, both linked into the commercial pages, and a
 * visitor was asked to work out which was which. They are now all guides.
 *
 * "Decisions" became "reports" for the same reason. The header said Reports,
 * the footer said Decisions and the URL said /decision, which is three names
 * for one product.
 */
export const collections: Record<CollectionId, Collection> = {
  reports: {
    id: "reports",
    dir: "reports",
    basePath: "/reports",
    label: "Reports",
    labelSingular: "Report",
    title: "Reports",
    description:
      "One page per question. What it answers, what to send, what we find in a real company's figures, and what €9 unlocks.",
    schemaType: "WebPage",
    categoryPages: true,
    inFeed: false,
    order: 1,
  },
  faq: {
    id: "faq",
    dir: "faq",
    basePath: "/faq",
    label: "FAQ",
    labelSingular: "Answer",
    title: "Questions about business value",
    description:
      "One question, one page, one answer. The things owners actually ask before they find out what their company is worth.",
    schemaType: "WebPage",
    categoryPages: true,
    inFeed: false,
    order: 3,
  },
  guides: {
    id: "guides",
    dir: "guides",
    basePath: "/guides",
    label: "Guides",
    labelSingular: "Guide",
    title: "Guides",
    description:
      "How the numbers actually work: the reasoning, the mistakes, and the thresholds that move the answer. Free, and enough to do it yourself.",
    schemaType: "TechArticle",
    categoryPages: true,
    inFeed: true,
    order: 2,
  },
};

export const collectionList = Object.values(collections).sort(
  (a, b) => a.order - b.order,
);

export function getCollection(id: CollectionId): Collection {
  return collections[id];
}

export function docHref(id: CollectionId, slug: string): string {
  return `${collections[id].basePath}/${slug}`;
}
