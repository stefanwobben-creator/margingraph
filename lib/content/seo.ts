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
    publisher: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
    },
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
