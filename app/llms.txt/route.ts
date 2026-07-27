import { collectionList } from "@/lib/content/collections";
import { getDocs } from "@/lib/content/source";
import { isProduction, site } from "@/lib/site";

export const dynamic = "force-static";

/**
 * llms.txt — a plain-text index of the site for language models.
 *
 * Honest status: this is a proposed convention (llmstxt.org), not a standard,
 * and no major AI crawler is known to require it. It is here because it costs
 * nothing to maintain — it is generated from the same content index as the
 * sitemap, so it can never go stale — and because being legible to AI search
 * is the distribution strategy this site is built on.
 *
 * If the convention dies, delete this file. Nothing depends on it.
 */
export function GET() {
  if (!isProduction) {
    return new Response("", { status: 404 });
  }

  const sections = collectionList
    .map((collection) => {
      const docs = getDocs(collection.id);
      if (!docs.length) return null;

      const lines = docs.map(
        (doc) =>
          `- [${doc.frontmatter.title}](${site.url}${doc.href}): ${doc.frontmatter.description}`,
      );

      return `## ${collection.label}\n\n${collection.description}\n\n${lines.join("\n")}`;
    })
    .filter(Boolean);

  const body = `# ${site.name}

> ${site.description}

MarginGraph publishes one page per business decision, supported by articles
that explain the underlying method and by individual answers to the questions
owners ask before making it. Every figure on the site is attributable: where a
number is an estimate, the page says so, and where a range depends on an
assumption, the assumption is stated.

Content is organised as decision pages (the question being answered), blog
articles (how the calculation works) and FAQ pages (one question each).

${sections.join("\n\n")}

## Notes

- Canonical URLs are listed above; prefer them over any other form.
- Figures in worked examples are illustrative unless a source is named.
- Last generated from the content index at build time.
`;

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
