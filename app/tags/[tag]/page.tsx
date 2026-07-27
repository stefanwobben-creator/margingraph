import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs, type Crumb } from "@/components/content/breadcrumbs";
import { DocCard } from "@/components/content/doc-card";
import { Container } from "@/components/layout/container";
import { SectionHeader } from "@/components/layout/section";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/content/seo";
import { getDocsByTag, getTags, slugify, toSummary } from "@/lib/content/source";

type Params = { params: Promise<{ tag: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  return getTags().map((tag) => ({ tag: slugify(tag.name) }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { tag } = await params;
  const docs = getDocsByTag(tag);
  if (!docs.length) return {};
  const name = docs[0].frontmatter.tags?.find((item) => slugify(item) === tag) ?? tag;

  return buildMetadata({
    title: `${name}`,
    description: `Everything tagged ${name} — ${docs.length} ${docs.length === 1 ? "page" : "pages"} across decisions, guides and articles.`,
    path: `/tags/${tag}`,
  });
}

/** Tags are global on purpose: they cross collections, categories do not. */
export default async function TagPage({ params }: Params) {
  const { tag } = await params;
  const docs = getDocsByTag(tag);
  if (!docs.length) notFound();

  const name =
    docs[0].frontmatter.tags?.find((item) => slugify(item) === tag) ?? tag;
  const trail: Crumb[] = [
    { name: "Home", path: "/" },
    { name: "Tags", path: `/tags/${tag}` },
    { name, path: `/tags/${tag}` },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd(trail)),
        }}
      />
      <section className="py-14 sm:py-20">
        <Container>
          <Breadcrumbs trail={trail} />
          <div className="mt-10">
            <SectionHeader
              eyebrow="Tag"
              title={name}
              description={`${docs.length} ${docs.length === 1 ? "page" : "pages"} across every collection.`}
            />
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {docs.map((doc) => (
              <DocCard
                key={`${doc.collection}-${doc.slug}`}
                doc={toSummary(doc)}
                showCollection
              />
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
