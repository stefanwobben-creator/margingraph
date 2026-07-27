import type { Metadata } from "next";

import { getCollection } from "@/lib/content/collections";
import type { Doc } from "@/lib/content/types";
import { site } from "@/lib/site";

const absolute = (path: string) =>
  path.startsWith("http") ? path : `${site.url}${path}`;

/**
 * Next only applies the file-based `opengraph-image` convention to pages that
 * do not return an `openGraph` object of their own. Every content page does,
 * so the default has to be attached explicitly here or those pages ship with
 * no social card at all.
 */
const DEFAULT_OG_IMAGE = `${site.url}/opengraph-image`;

/**
 * The single place metadata is built. Every route calls this — there is no
 * second implementation, so a change to the OpenGraph shape happens once.
 */
export function buildMetadata({
  title,
  description,
  path,
  image,
  canonical,
  type = "website",
  publishedTime,
  modifiedTime,
  authors,
  noIndex,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  canonical?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  noIndex?: boolean;
}): Metadata {
  const url = absolute(path);
  const images = [{ url: image ? absolute(image) : DEFAULT_OG_IMAGE }];

  return {
    title,
    description,
    alternates: { canonical: canonical ? absolute(canonical) : url },
    robots: noIndex ? { index: false, follow: true } : undefined,
    openGraph: {
      type,
      url,
      siteName: site.name,
      title: `${title} — ${site.name}`,
      description,
      images,
      ...(type === "article"
        ? { publishedTime, modifiedTime, authors }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — ${site.name}`,
      description,
      images: images.map((item) => item.url),
    },
  };
}

export function docMetadata(doc: Doc): Metadata {
  const { frontmatter } = doc;
  const collection = getCollection(doc.collection);

  return buildMetadata({
    title: frontmatter.seoTitle ?? frontmatter.title,
    description: frontmatter.description,
    path: doc.href,
    image: frontmatter.image,
    canonical: frontmatter.canonical,
    type: collection.schemaType === "WebPage" ? "website" : "article",
    publishedTime: frontmatter.date,
    modifiedTime: frontmatter.updated ?? frontmatter.date,
    authors: frontmatter.author ? [frontmatter.author] : undefined,
  });
}

/* -------------------------------------------------------------------------- */
/* JSON-LD                                                                     */
/* -------------------------------------------------------------------------- */

export type JsonLd = Record<string, unknown>;

/**
 * Stable @id values for the two site-wide nodes.
 *
 * Every page-level schema references these rather than repeating the
 * publisher inline, so the graph has one Organization node and one WebSite
 * node no matter how many thousands of pages exist.
 */
export const ORGANIZATION_ID = `${site.url}/#organization`;
export const WEBSITE_ID = `${site.url}/#website`;

/**
 * Emitted on the homepage only. Google's guidance for both Organization and
 * for the site name feature is to place the markup on the most representative
 * page — repeating it on every page adds bytes and no signal.
 *
 * Deliberately absent: aggregateRating and review (there are none), sameAs
 * (no verified profiles yet), address and contactPoint (no published details
 * yet). Unsupported or invented properties are worse than missing ones.
 */
export function organizationJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: site.name,
    url: site.url,
    description: site.description,
    logo: {
      "@type": "ImageObject",
      // Google requires a logo of at least 112x112. This is the site's actual
      // mark, generated in app/apple-icon.tsx.
      url: `${site.url}/apple-icon`,
      width: 180,
      height: 180,
    },
  };
}

/**
 * Establishes the site name Google shows in results.
 *
 * No `potentialAction: SearchAction` — the sitelinks search box it powered was
 * retired, and this site has no search endpoint for it to point at. Markup for
 * a feature that no longer exists, aimed at a route that does not exist, is
 * two problems rather than an optimisation.
 */
export function websiteJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: site.name,
    url: site.url,
    description: site.description,
    inLanguage: site.locale,
    publisher: { "@id": ORGANIZATION_ID },
  };
}

export function breadcrumbJsonLd(
  trail: { name: string; path: string }[],
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absolute(item.path),
    })),
  };
}

export function articleJsonLd(doc: Doc): JsonLd {
  const { frontmatter } = doc;
  const collection = getCollection(doc.collection);

  return {
    "@context": "https://schema.org",
    "@type": collection.schemaType,
    headline: frontmatter.title,
    description: frontmatter.description,
    url: absolute(doc.href),
    datePublished: frontmatter.date,
    dateModified: frontmatter.updated ?? frontmatter.date,
    inLanguage: site.locale,
    ...(frontmatter.image ? { image: absolute(frontmatter.image) } : {}),
    ...(frontmatter.author
      ? { author: { "@type": "Person", name: frontmatter.author } }
      : {}),
    publisher: { "@id": ORGANIZATION_ID },
    isPartOf: { "@id": WEBSITE_ID },
    mainEntityOfPage: { "@type": "WebPage", "@id": absolute(doc.href) },
    ...(frontmatter.tags?.length ? { keywords: frontmatter.tags.join(", ") } : {}),
    wordCount: doc.wordCount,
  };
}

/** Only emitted when the document actually shows an FAQ on the page. */
export function faqJsonLd(
  faq: { question: string; answer: string }[],
): JsonLd | null {
  if (!faq.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function itemListJsonLd(
  name: string,
  items: { title: string; href: string }[],
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.title,
      url: absolute(item.href),
    })),
  };
}
