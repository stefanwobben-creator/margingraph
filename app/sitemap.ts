import type { MetadataRoute } from "next";

import { collectionList } from "@/lib/content/collections";
import { getCategories, getDocs, getTags } from "@/lib/content/source";
import { site } from "@/lib/site";

/**
 * Generated entirely from the content tree. Publishing a file puts it in the
 * sitemap; there is no list to maintain and nothing can point at a route that
 * does not exist.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [
    { url: site.url, changeFrequency: "weekly", priority: 1 },
  ];

  for (const collection of collectionList) {
    const docs = getDocs(collection.id);
    if (!docs.length) continue;

    entries.push({
      url: `${site.url}${collection.basePath}`,
      changeFrequency: "weekly",
      priority: 0.8,
    });

    for (const doc of docs) {
      entries.push({
        url: `${site.url}${doc.href}`,
        lastModified: doc.frontmatter.updated ?? doc.frontmatter.date,
        changeFrequency: "monthly",
        priority: collection.id === "decisions" ? 0.9 : 0.7,
      });
    }

    if (collection.categoryPages) {
      for (const category of getCategories(collection.id)) {
        entries.push({
          url: `${site.url}${collection.basePath}/category/${category.slug}`,
          changeFrequency: "monthly",
          priority: 0.5,
        });
      }
    }
  }

  for (const tag of getTags()) {
    entries.push({
      url: `${site.url}/tags/${tag.slug}`,
      changeFrequency: "monthly",
      priority: 0.4,
    });
  }

  return entries;
}
