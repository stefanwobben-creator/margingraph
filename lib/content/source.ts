import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";

import { collections, docHref } from "@/lib/content/collections";
import { ContentError, parseFrontmatter } from "@/lib/content/schema";
import { extractHeadings } from "@/lib/content/toc";
import type {
  CollectionId,
  Doc,
  DocSummary,
} from "@/lib/content/types";

const CONTENT_DIR = path.join(process.cwd(), "content");
const WORDS_PER_MINUTE = 220;

/**
 * Everything is read once per process and cached. At 5,000 documents this
 * matters: `generateStaticParams` and every page render would otherwise hit
 * the filesystem again.
 */
let cache: Map<CollectionId, Doc[]> | null = null;

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

function readCollection(id: CollectionId): Doc[] {
  const dir = path.join(CONTENT_DIR, collections[id].dir);
  if (!fs.existsSync(dir)) return [];

  const files = fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".mdx") || file.endsWith(".md"));

  const docs = files.map((file) => {
    const raw = fs.readFileSync(path.join(dir, file), "utf8");
    const { data, content } = matter(raw);
    const relative = `content/${id}/${file}`;
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
  });

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

  // Newest first. Ties broken by slug so ordering is deterministic.
  return docs.sort((a, b) => {
    const diff = b.frontmatter.date.localeCompare(a.frontmatter.date);
    return diff !== 0 ? diff : a.slug.localeCompare(b.slug);
  });
}

function load(): Map<CollectionId, Doc[]> {
  if (cache) return cache;
  cache = new Map();
  for (const id of Object.keys(collections) as CollectionId[]) {
    cache.set(id, readCollection(id));
  }
  return cache;
}

/** Drafts are excluded from every listing and every route, in every environment. */
function isPublished(doc: Doc): boolean {
  return doc.frontmatter.draft !== true;
}

export function getDocs(id: CollectionId): Doc[] {
  return load().get(id)!.filter(isPublished);
}

export function getAllDocs(): Doc[] {
  return [...load().values()].flat().filter(isPublished);
}

export function getDoc(id: CollectionId, slug: string): Doc | undefined {
  return getDocs(id).find((doc) => doc.slug === slug);
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
  };
}

export function getSummaries(id: CollectionId): DocSummary[] {
  return getDocs(id).map(toSummary);
}

/* -------------------------------------------------------------------------- */
/* Taxonomy                                                                    */
/* -------------------------------------------------------------------------- */

export function getCategories(id: CollectionId): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const doc of getDocs(id)) {
    const category = doc.frontmatter.category;
    if (!category) continue;
    counts.set(category, (counts.get(category) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getDocsByCategory(id: CollectionId, category: string): Doc[] {
  return getDocs(id).filter(
    (doc) => slugify(doc.frontmatter.category ?? "") === category,
  );
}

export function getTags(): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const doc of getAllDocs()) {
    for (const tag of doc.frontmatter.tags ?? []) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function getDocsByTag(tag: string): Doc[] {
  return getAllDocs().filter((doc) =>
    (doc.frontmatter.tags ?? []).some((item) => slugify(item) === tag),
  );
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
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
  const index = docs.findIndex((item) => item.slug === doc.slug);
  return {
    // The list is newest-first, so "next" is the newer neighbour.
    next: index > 0 ? toSummary(docs[index - 1]) : undefined,
    previous:
      index >= 0 && index < docs.length - 1
        ? toSummary(docs[index + 1])
        : undefined,
  };
}

/**
 * Explicit `related` entries first, then filled up automatically by shared
 * tags and category. Explicit always wins, so an author can override.
 */
export function getRelated(doc: Doc, limit = 3): DocSummary[] {
  const all = getAllDocs().filter(
    (item) => !(item.collection === doc.collection && item.slug === doc.slug),
  );
  const picked: Doc[] = [];

  for (const reference of doc.frontmatter.related ?? []) {
    const [maybeCollection, maybeSlug] = reference.includes("/")
      ? reference.split("/")
      : [undefined, reference];
    const match = all.find(
      (item) =>
        item.slug === maybeSlug &&
        (maybeCollection === undefined ||
          item.collection === maybeCollection ||
          collections[item.collection].basePath === `/${maybeCollection}`),
    );
    if (match && !picked.includes(match)) picked.push(match);
  }

  if (picked.length < limit) {
    const tags = new Set(doc.frontmatter.tags ?? []);
    const scored = all
      .filter((item) => !picked.includes(item))
      .map((item) => {
        const shared = (item.frontmatter.tags ?? []).filter((tag) =>
          tags.has(tag),
        ).length;
        const sameCategory =
          doc.frontmatter.category &&
          item.frontmatter.category === doc.frontmatter.category
            ? 1
            : 0;
        return { item, score: shared * 2 + sameCategory };
      })
      .filter((entry) => entry.score > 0)
      .sort(
        (a, b) =>
          b.score - a.score ||
          b.item.frontmatter.date.localeCompare(a.item.frontmatter.date),
      );

    for (const entry of scored) {
      if (picked.length >= limit) break;
      picked.push(entry.item);
    }
  }

  return picked.slice(0, limit).map(toSummary);
}
