import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs, type Crumb } from "@/components/content/breadcrumbs";
import { DocCard } from "@/components/content/doc-card";
import { DocPage } from "@/components/content/doc-page";
import { Container } from "@/components/layout/container";
import { SectionHeader } from "@/components/layout/section";
import { getCollection } from "@/lib/content/collections";
import {
  breadcrumbJsonLd,
  buildMetadata,
  docMetadata,
  itemListJsonLd,
} from "@/lib/content/seo";
import {
  getCategories,
  getDoc,
  getDocs,
  getDocsByCategory,
  getSummaries,
  slugify,
  toSummary,
} from "@/lib/content/source";
import type { CollectionId } from "@/lib/content/types";

type SlugParams = { params: Promise<{ slug: string }> };
type CategoryParams = { params: Promise<{ category: string }> };

/**
 * Produces every route handler a collection needs.
 *
 * A new content type is one entry in `collections.ts` plus three route files
 * that each export what this returns. No page logic is ever written twice.
 */
export function createCollectionRoutes(id: CollectionId) {
  const collection = getCollection(id);

  /* ---------------------------------------------------------------- detail */

  async function generateStaticParams() {
    return getDocs(id).map((doc) => ({ slug: doc.slug }));
  }

  async function generateMetadata({ params }: SlugParams): Promise<Metadata> {
    const { slug } = await params;
    const doc = getDoc(id, slug);
    if (!doc) return {};
    return docMetadata(doc);
  }

  async function Page({ params }: SlugParams) {
    const { slug } = await params;
    const doc = getDoc(id, slug);
    if (!doc) notFound();
    return <DocPage doc={doc} />;
  }

  /* ----------------------------------------------------------------- index */

  const indexMetadata: Metadata = buildMetadata({
    title: collection.title,
    description: collection.description,
    path: collection.basePath,
  });

  function IndexPage() {
    const docs = getSummaries(id);
    const categories = collection.categoryPages ? getCategories(id) : [];
    const trail: Crumb[] = [
      { name: "Home", path: "/" },
      { name: collection.label, path: collection.basePath },
    ];

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbJsonLd(trail)),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              itemListJsonLd(
                collection.title,
                docs.map((doc) => ({ title: doc.title, href: doc.href })),
              ),
            ),
          }}
        />

        <section className="py-14 sm:py-20">
          <Container>
            <Breadcrumbs trail={trail} />
            <div className="mt-10">
              <SectionHeader
                title={collection.title}
                description={collection.description}
              />
            </div>

            {categories.length > 1 ? (
              <ul className="mt-8 flex flex-wrap gap-2">
                {categories.map((category) => (
                  <li key={category.name}>
                    <a
                      href={`${collection.basePath}/category/${slugify(category.name)}`}
                      className="inline-flex rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-foreground/25 hover:text-foreground"
                    >
                      {category.name} ({category.count})
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}

            {docs.length ? (
              <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {docs.map((doc) => (
                  <DocCard key={doc.slug} doc={doc} />
                ))}
              </div>
            ) : (
              <p className="mt-12 text-muted-foreground">
                Nothing published here yet.
              </p>
            )}
          </Container>
        </section>
      </>
    );
  }

  /* -------------------------------------------------------------- category */

  async function generateCategoryParams() {
    if (!collection.categoryPages) return [];
    return getCategories(id).map((category) => ({
      category: slugify(category.name),
    }));
  }

  async function generateCategoryMetadata({
    params,
  }: CategoryParams): Promise<Metadata> {
    const { category } = await params;
    const docs = getDocsByCategory(id, category);
    if (!docs.length) return {};
    const name = docs[0].frontmatter.category ?? category;

    return buildMetadata({
      title: `${name} — ${collection.label}`,
      description: `Every ${collection.labelSingular.toLowerCase()} on ${name}. ${docs.length} published.`,
      path: `${collection.basePath}/category/${category}`,
    });
  }

  async function CategoryPage({ params }: CategoryParams) {
    const { category } = await params;
    const docs = getDocsByCategory(id, category);
    if (!docs.length) notFound();

    const name = docs[0].frontmatter.category ?? category;
    const trail: Crumb[] = [
      { name: "Home", path: "/" },
      { name: collection.label, path: collection.basePath },
      { name, path: `${collection.basePath}/category/${category}` },
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
                eyebrow={collection.label}
                title={name}
                description={`${docs.length} published.`}
              />
            </div>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {docs.map((doc) => (
                <DocCard key={doc.slug} doc={toSummary(doc)} />
              ))}
            </div>
          </Container>
        </section>
      </>
    );
  }

  return {
    generateStaticParams,
    generateMetadata,
    Page,
    indexMetadata,
    IndexPage,
    generateCategoryParams,
    generateCategoryMetadata,
    CategoryPage,
  };
}
