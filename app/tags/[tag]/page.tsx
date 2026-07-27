import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ListingPage } from "@/lib/content/routes";
import { buildMetadata } from "@/lib/content/seo";
import { getDocsByTag, getTagName, getTags, toSummary } from "@/lib/content/source";

type Params = { params: Promise<{ tag: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  return getTags().map((tag) => ({ tag: tag.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { tag } = await params;
  const docs = getDocsByTag(tag);
  if (!docs.length) return {};
  const name = getTagName(tag);

  return buildMetadata({
    title: name,
    description: `Everything tagged ${name} — ${docs.length} ${docs.length === 1 ? "page" : "pages"} across decisions, guides and articles.`,
    path: `/tags/${tag}`,
    noIndex: docs.length < 2,
  });
}

/** Tags are global on purpose: they cross collections, categories do not. */
export default async function TagPage({ params }: Params) {
  const { tag } = await params;
  const docs = getDocsByTag(tag);
  if (!docs.length) notFound();

  const name = getTagName(tag);
  const display = name.charAt(0).toUpperCase() + name.slice(1);

  return (
    <ListingPage
      trail={[
        { name: "Home", path: "/" },
        { name, path: `/tags/${tag}` },
      ]}
      eyebrow="Tag"
      title={display}
      description={`${docs.length} ${docs.length === 1 ? "page" : "pages"} across every collection.`}
      docs={docs.map(toSummary)}
      showCollection
    />
  );
}
