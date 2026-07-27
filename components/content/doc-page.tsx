import { Breadcrumbs, type Crumb } from "@/components/content/breadcrumbs";
import { DocMeta } from "@/components/content/doc-meta";
import { DocPager, RelatedDocs } from "@/components/content/doc-navigation";
import { JsonLd } from "@/components/content/json-ld";
import { TaxonomyLinks } from "@/components/content/taxonomy-links";
import { TableOfContents } from "@/components/content/table-of-contents";
import { Container } from "@/components/layout/container";
import { Faq } from "@/components/mdx/faq-block";
import { getCollection } from "@/lib/content/collections";
import { Mdx } from "@/lib/content/mdx";
import {
  articleJsonLd,
  breadcrumbJsonLd,
  faqJsonLd,
} from "@/lib/content/seo";
import { getRelated, getSiblings, slugify } from "@/lib/content/source";
import type { Doc } from "@/lib/content/types";

/**
 * The layout every document in every collection uses.
 *
 * One file. Change the reading experience here and 5,000 pages follow.
 */
export async function DocPage({ doc }: { doc: Doc }) {
  const collection = getCollection(doc.collection);
  const { previous, next } = getSiblings(doc);
  const related = getRelated(doc);
  const faq = doc.frontmatter.faq ?? [];

  const trail: Crumb[] = [
    { name: "Home", path: "/" },
    { name: collection.label, path: collection.basePath },
    { name: doc.frontmatter.title, path: doc.href },
  ];

  return (
    <>
      <JsonLd
        schemas={[articleJsonLd(doc), breadcrumbJsonLd(trail), faqJsonLd(faq)]}
      />

      <article className="py-14 sm:py-20">
        <Container>
          <Breadcrumbs trail={trail} />

          <header className="mt-10 max-w-prose-page">
            <h1 className="text-title text-balance sm:text-display">
              {doc.frontmatter.title}
            </h1>
            <p className="mt-5 text-lead text-muted-foreground">
              {doc.frontmatter.description}
            </p>
            <div className="mt-7">
              <DocMeta doc={doc} />
            </div>
          </header>

          <div className="mt-14 gap-16 lg:grid lg:grid-cols-[minmax(0,44rem)_minmax(0,15rem)]">
            <div className="min-w-0">
              <Mdx source={doc.body} />

              {faq.length ? <Faq items={faq} idPrefix={doc.slug} /> : null}

              {doc.frontmatter.tags?.length ? (
                <div className="mt-14 border-t border-border pt-8">
                  <TaxonomyLinks
                    items={doc.frontmatter.tags.map((tag) => ({
                      label: tag,
                      href: `/tags/${slugify(tag)}`,
                    }))}
                  />
                </div>
              ) : null}

              <DocPager previous={previous} next={next} />
              <RelatedDocs docs={related} />
            </div>

            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <TableOfContents headings={doc.headings} />
              </div>
            </aside>
          </div>
        </Container>
      </article>
    </>
  );
}
