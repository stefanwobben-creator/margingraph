import type { MetadataRoute } from "next";

import { collectionList } from "@/lib/content/collections";
import { getCategories, getDocs, getTags } from "@/lib/content/source";
import { site } from "@/lib/site";

/**
 * Generated entirely from the content tree. Publishing a file puts it in the
 * sitemap; there is no list to maintain and nothing can point at a route that
 * does not exist.
 *
 * Scale note: a single sitemap may hold 50,000 URLs or 50 MB uncompressed.
 * Past that, split with Next's `generateSitemaps`, which changes the URLs to
 * /sitemap/[id].xml and turns /sitemap.xml into the index. Resubmitting after
 * that change is harmless, so there is no reason to shard early — but the
 * threshold is worth knowing before it arrives.
 */
const SITEMAP_URL_LIMIT = 50_000;

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [
    { url: site.url, changeFrequency: "weekly", priority: 1 },
  ];

  for (const collection of collectionList) {
    const docs = getDocs(collection.id);
    if (!docs.length) continue;

    // Docs are sorted newest first, so the first one dates the index page.
    const newest = docs[0].frontmatter.updated ?? docs[0].frontmatter.date;

    entries.push({
      url: `${site.url}${collection.basePath}`,
      lastModified: newest,
      changeFrequency: "weekly",
      priority: 0.8,
    });

    for (const doc of docs) {
      entries.push({
        url: `${site.url}${doc.href}`,
        lastModified: doc.frontmatter.updated ?? doc.frontmatter.date,
        changeFrequency: "monthly",
        // Decision pages are the commercial destination; everything else
        // exists to lead there.
        priority: collection.id === "decisions" ? 0.9 : 0.7,
      });
    }

    if (collection.categoryPages) {
      for (const category of getCategories(collection.id)) {
        // Single-document taxonomy pages are noindex — see routes.tsx. Keeping
        // them out of the sitemap as well avoids asking crawlers to fetch a
        // page we have already told them not to index.
        if (category.count < 2) continue;
        entries.push({
          url: `${site.url}${collection.basePath}/category/${category.slug}`,
          changeFrequency: "monthly",
          priority: 0.5,
        });
      }
    }
  }

  for (const tag of getTags()) {
    if (tag.count < 2) continue;
    entries.push({
      url: `${site.url}/tags/${tag.slug}`,
      changeFrequency: "monthly",
      priority: 0.4,
    });
  }

  if (entries.length > SITEMAP_URL_LIMIT) {
    throw new Error(
      `Sitemap has ${entries.length} URLs, over the ${SITEMAP_URL_LIMIT} limit. ` +
        `Split it with generateSitemaps before deploying.`,
    );
  }

  return entries;
}
