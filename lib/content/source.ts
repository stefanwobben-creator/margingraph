import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";

import { collections, docHref } from "@/lib/content/collections";
import { ContentError, parseFrontmatter } from "@/lib/content/schema";
import { extractHeadings } from "@/lib/content/toc";
import type { CollectionId, Doc, DocSummary } from "@/lib/content/types";

const CONTENT_DIR = path.join(process.cwd(), "content");
const WORDS_PER_MINUTE = 220;

/**
 * The content index.
 *
 * Built once per process. Everything that would otherwise be a scan — related
 * documents, tag pages, category pages — is a map lookup instead.
 *
 * This matters at scale: naive `filter` over all documents inside a function
 * called once per page is O(n²). At 5,000 documents that is 25 million
 * comparisons per build. With the maps below it is linear.
 */
type Index = {
  byCollection: Map<CollectionId, Doc[]>;
  bySlug: Map<string, Doc>;
  all: Doc[];
  byTag: Map<string, Doc[]>;
  tagNames: Map<string, string>;
  byCategory: Map<string, Doc[]>;
  categoryNames: Map<string, string>;
  /** Position of each doc inside its collection, for previous/next. */
  position: Map<string, number>;
};

let index: Index | null = null;

const key = (collection: CollectionId, slug: string) => `${collection}/${slug}`;

function slugFromFilename(file: string): string {
  return file.replace(/\.mdx?$/, "");
}

function countWords(body: string): number {
  return body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function readCollection(id: CollectionId): Doc[] {
  const dir = path.join(CONTENT_DIR, collections[id].dir);
  if (!fs.existsSync(dir)) return [];

  const docs = fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".mdx") || file.endsWith(".md"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(dir, file), "utf8");
      const relative = `content/${id}/${file}`;

      // gray-matter throws a YAML error that does not name the file. At 5,000
      // documents that is unusable, so re-throw with the path attached.
      let data: unknown;
      let content: string;
      try {
        const parsed = matter(raw);
        data = parsed.data;
        content = parsed.content;
      } catch (error) {
        throw new ContentError(
          relative,
          `${(error as Error).message}\n\nA value containing ": " must be quoted.`,
        );
      }

      const frontmatter = parseFrontmatter(data, relative);
      const slug = frontmatter.slug ?? slugFromFilename(file);

      if (!/^[a-z0-9-]+$/.test(slug)) {
        throw new ContentError(
          relative,
          `slug "${slug}" must be lowercase letters, numbers and hyphens only`,
        );
      }

      const wordCount = countWords(content);

      return {
        collection: id,
        slug,
        href: docHref(id, slug),
        frontmatter,
        body: content,
        headings: extractHeadings(content),
        wordCount,
        readingMinutes: Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE)),
      } satisfies Doc;
    })
    // Drafts never exist beyond this point — not in listings, routes, feeds or
    // preview deployments.
    .filter((doc) => doc.frontmatter.draft !== true);

  const seen = new Set<string>();
  for (const doc of docs) {
    if (seen.has(doc.slug)) {
      throw new ContentError(
        `content/${id}`,
        `duplicate slug "${doc.slug}" — slugs are permanent URLs and must be unique`,
      );
    }
    seen.add(doc.slug);
  }

  // Newest first. Ties broken by slug so ordering is deterministic across builds.
  return docs.sort((a, b) => {
    const diff = b.frontmatter.date.localeCompare(a.frontmatter.date);
    return diff !== 0 ? diff : a.slug.localeCompare(b.slug);
  });
}

function build(): Index {
  const byCollection = new Map<CollectionId, Doc[]>();
  const bySlug = new Map<string, Doc>();
  const byTag = new Map<string, Doc[]>();
  const tagNames = new Map<string, string>();
  const byCategory = new Map<string, Doc[]>();
  const categoryNames = new Map<string, string>();
  const position = new Map<string, number>();
  const all: Doc[] = [];

  for (const id of Object.keys(collections) as CollectionId[]) {
    const docs = readCollection(id);
    byCollection.set(id, docs);

    docs.forEach((doc, order) => {
      all.push(doc);
      bySlug.set(key(doc.collection, doc.slug), doc);
      position.set(key(doc.collection, doc.slug), order);

      for (const tag of doc.frontmatter.tags ?? []) {
        const tagSlug = slugify(tag);
        if (!tagSlug) continue;
        tagNames.set(tagSlug, tag);
        const bucket = byTag.get(tagSlug);
        if (bucket) bucket.push(doc);
        else byTag.set(tagSlug, [doc]);
      }

      const category = doc.frontmatter.category;
      if (category) {
        const categoryKey = `${doc.collection}/${slugify(category)}`;
        categoryNames.set(categoryKey, category);
        const bucket = byCategory.get(categoryKey);
        if (bucket) bucket.push(doc);
        else byCategory.set(categoryKey, [doc]);
      }
    });
  }

  return {
    byCollection,
    bySlug,
    all,
    byTag,
    tagNames,
    byCategory,
    categoryNames,
    position,
  };
}

function getIndex(): Index {
  if (!index) index = build();
  return index;
}

/* -------------------------------------------------------------------------- */
/* Reads                                                                       */
/* -------------------------------------------------------------------------- */

export function getDocs(id: CollectionId): Doc[] {
  return getIndex().byCollection.get(id) ?? [];
}

export function getAllDocs(): Doc[] {
  return getIndex().all;
}

export function getDoc(id: CollectionId, slug: string): Doc | undefined {
  return getIndex().bySlug.get(key(id, slug));
}

export function toSummary(doc: Doc): DocSummary {
  return {
    collection: doc.collection,
    slug: doc.slug,
    href: doc.href,
    readingMinutes: doc.readingMinutes,
    title: doc.frontmatter.title,
    description: doc.frontmatter.description,
    date: doc.frontmatter.date,
    updated: doc.frontmatter.updated ?? doc.frontmatter.date,
    category: doc.frontmatter.category,
    tags: doc.frontmatter.tags ?? [],
    featured: doc.frontmatter.featured === true,
    price: doc.frontmatter.price,
  };
}

export function getSummaries(id: CollectionId): DocSummary[] {
  return getDocs(id).map(toSummary);
}

/* -------------------------------------------------------------------------- */
/* Taxonomy — all map lookups, no scans                                        */
/* -------------------------------------------------------------------------- */

export function getCategories(
  id: CollectionId,
): { name: string; slug: string; count: number }[] {
  const { byCategory, categoryNames } = getIndex();
  const prefix = `${id}/`;

  return [...byCategory.entries()]
    .filter(([categoryKey]) => categoryKey.startsWith(prefix))
    .map(([categoryKey, docs]) => ({
      name: categoryNames.get(categoryKey)!,
      slug: categoryKey.slice(prefix.length),
      count: docs.length,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getDocsByCategory(id: CollectionId, category: string): Doc[] {
  return getIndex().byCategory.get(`${id}/${category}`) ?? [];
}

export function getCategoryName(id: CollectionId, category: string): string {
  return getIndex().categoryNames.get(`${id}/${category}`) ?? category;
}

export function getTags(): { name: string; slug: string; count: number }[] {
  const { byTag, tagNames } = getIndex();

  return [...byTag.entries()]
    .map(([slug, docs]) => ({
      name: tagNames.get(slug)!,
      slug,
      count: docs.length,
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function getDocsByTag(tag: string): Doc[] {
  return getIndex().byTag.get(tag) ?? [];
}

export function getTagName(tag: string): string {
  return getIndex().tagNames.get(tag) ?? tag;
}

/* -------------------------------------------------------------------------- */
/* Relationships                                                               */
/* -------------------------------------------------------------------------- */

/** Previous and next within the same collection, by date. */
export function getSiblings(doc: Doc): {
  previous?: DocSummary;
  next?: DocSummary;
} {
  const docs = getDocs(doc.collection);
  const order = getIndex().position.get(key(doc.collection, doc.slug));
  if (order === undefined) return {};

  return {
    // The list is newest-first, so the earlier index is the newer neighbour.
    next: order > 0 ? toSummary(docs[order - 1]) : undefined,
    previous:
      order < docs.length - 1 ? toSummary(docs[order + 1]) : undefined,
  };
}

/**
 * Explicit `related` entries first, then filled up from documents that share a
 * tag or category. Candidates come from the tag and category maps rather than
 * from a scan of every document.
 */
export function getRelated(doc: Doc, limit = 3): DocSummary[] {
  const self = key(doc.collection, doc.slug);
  const picked = new Map<string, Doc>();

  for (const reference of doc.frontmatter.related ?? []) {
    const match = resolveReference(reference);
    if (match && key(match.collection, match.slug) !== self) {
      picked.set(key(match.collection, match.slug), match);
    }
    if (picked.size >= limit) break;
  }

  if (picked.size < limit) {
    const scores = new Map<string, { doc: Doc; score: number }>();

    const consider = (candidate: Doc, weight: number) => {
      const candidateKey = key(candidate.collection, candidate.slug);
      if (candidateKey === self || picked.has(candidateKey)) return;
      const existing = scores.get(candidateKey);
      if (existing) existing.score += weight;
      else scores.set(candidateKey, { doc: candidate, score: weight });
    };

    for (const tag of doc.frontmatter.tags ?? []) {
      for (const candidate of getDocsByTag(slugify(tag))) consider(candidate, 2);
    }
    if (doc.frontmatter.category) {
      for (const candidate of getDocsByCategory(
        doc.collection,
        slugify(doc.frontmatter.category),
      )) {
        consider(candidate, 1);
      }
    }

    const ranked = [...scores.values()].sort(
      (a, b) =>
        b.score - a.score ||
        b.doc.frontmatter.date.localeCompare(a.doc.frontmatter.date),
    );

    for (const entry of ranked) {
      if (picked.size >= limit) break;
      picked.set(key(entry.doc.collection, entry.doc.slug), entry.doc);
    }
  }

  return [...picked.values()].slice(0, limit).map(toSummary);
}

/** Resolves `collection/slug`, `basePath/slug` or a bare `slug`. */
function resolveReference(reference: string): Doc | undefined {
  const { bySlug, all } = getIndex();

  if (reference.includes("/")) {
    const [prefix, slug] = reference.split("/");
    const direct = bySlug.get(`${prefix}/${slug}`);
    if (direct) return direct;

    const collection = Object.values(collections).find(
      (item) => item.basePath === `/${prefix}`,
    );
    if (collection) return bySlug.get(`${collection.id}/${slug}`);
    return undefined;
  }

  return all.find((doc) => doc.slug === reference);
}
