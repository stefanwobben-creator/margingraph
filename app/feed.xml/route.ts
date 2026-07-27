import { collections } from "@/lib/content/collections";
import { getAllDocs } from "@/lib/content/source";
import { site } from "@/lib/site";

export const dynamic = "force-static";

/** Minimal XML escaping — enough for titles, descriptions and URLs. */
function escape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * RSS 2.0, generated at build time. Hand-written rather than pulled from a
 * package: it is forty lines, and one fewer dependency to keep alive for
 * five years.
 */
export function GET() {
  const docs = getAllDocs()
    .filter((doc) => collections[doc.collection].inFeed)
    .sort((a, b) => b.frontmatter.date.localeCompare(a.frontmatter.date))
    .slice(0, 50);

  const latest = docs[0]?.frontmatter.updated ?? docs[0]?.frontmatter.date;

  const items = docs
    .map((doc) => {
      const url = `${site.url}${doc.href}`;
      const categories = (doc.frontmatter.tags ?? [])
        .map((tag) => `      <category>${escape(tag)}</category>`)
        .join("\n");

      return `    <item>
      <title>${escape(doc.frontmatter.title)}</title>
      <link>${escape(url)}</link>
      <guid isPermaLink="true">${escape(url)}</guid>
      <description>${escape(doc.frontmatter.description)}</description>
      <pubDate>${new Date(`${doc.frontmatter.date}T00:00:00Z`).toUTCString()}</pubDate>
${categories}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(site.name)}</title>
    <link>${site.url}</link>
    <description>${escape(site.description)}</description>
    <language>${site.locale}</language>
    <atom:link href="${site.url}/feed.xml" rel="self" type="application/rss+xml" />${
      latest
        ? `\n    <lastBuildDate>${new Date(`${latest}T00:00:00Z`).toUTCString()}</lastBuildDate>`
        : ""
    }
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
