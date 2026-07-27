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
 * Decision pages are the commercial pages; blog posts are the informational
 * supply that links into them.
 */
export const collections: Record<CollectionId, Collection> = {
  decisions: {
    id: "decisions",
    dir: "decisions",
    basePath: "/decision",
    label: "Decisions",
    labelSingular: "Decision",
    title: "Decisions",
    description:
      "One page per business decision. What the question is, what you upload, and what the report gives you back.",
    schemaType: "WebPage",
    categoryPages: true,
    inFeed: false,
    order: 1,
  },
  blog: {
    id: "blog",
    dir: "blog",
    basePath: "/blog",
    label: "Blog",
    labelSingular: "Article",
    title: "Blog",
    description:
      "How the numbers behind each decision actually work — the reasoning, the mistakes and the thresholds that move the answer.",
    schemaType: "Article",
    categoryPages: true,
    inFeed: true,
    order: 2,
  },
  guides: {
    id: "guides",
    dir: "guides",
    basePath: "/guides",
    label: "Guides",
    labelSingular: "Guide",
    title: "Guides",
    description:
      "Longer walkthroughs for decisions that take more than one sitting.",
    schemaType: "TechArticle",
    categoryPages: true,
    inFeed: true,
    order: 3,
  },
  reports: {
    id: "reports",
    dir: "reports",
    basePath: "/reports",
    label: "Reports",
    labelSingular: "Report",
    title: "Reports",
    description: "The report catalogue.",
    schemaType: "WebPage",
    categoryPages: false,
    inFeed: false,
    order: 4,
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
