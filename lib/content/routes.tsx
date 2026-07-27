import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs, type Crumb } from "@/components/content/breadcrumbs";
import { DocCard } from "@/components/content/doc-card";
import { DocPage } from "@/components/content/doc-page";
import { JsonLd } from "@/components/content/json-ld";
import { TaxonomyLinks } from "@/components/content/taxonomy-links";
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
  getCategoryName,
  getDoc,
  getDocs,
  getDocsByCategory,
  getSummaries,
  toSummary,
} from "@/lib/content/source";
import type { CollectionId, DocSummary } from "@/lib/content/types";

type SlugParams = { params: Promise<{ slug: string }> };
type CategoryParams = { params: Promise<{ category: string }> };

/** Shared shell for every listing page — index, category and tag. */
export function ListingPage({
  trail,
  eyebrow,
  title,
  description,
  docs,
  showCollection = false,
  children,
}: {
  trail: Crumb[];
  eyebrow?: string;
  title: string;
  description?: string;
  docs: DocSummary[];
  showCollection?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <>
      <JsonLd
        schemas={[
          breadcrumbJsonLd(trail),
          itemListJsonLd(
            title,
            docs.map((doc) => ({ title: doc.title, href: doc.href })),
          ),
        ]}
      />

      <section className="py-14 sm:py-20">
        <Container>
          <Breadcrumbs trail={trail} />
          <div className="mt-10">
            <SectionHeader
              eyebrow={eyebrow}
              title={title}
              description={description}
            />
          </div>

          {children}

          {docs.length ? (
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {docs.map((doc) => (
                <DocCard
                  key={`${doc.collection}-${doc.slug}`}
                  doc={doc}
                  showCollection={showCollection}
                />
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

/**
 * Produces every route handler a collection needs.
 *
 * A new content type is one entry in `collections.ts` plus three route files
 * that each re-export what this returns. No page logic is ever written twice.
 */
export function createCollectionRoutes(id: CollectionId) {
  const collection = getCollection(id);
  const homeCrumb: Crumb = { name: "Home", path: "/" };
  const collectionCrumb: Crumb = {
    name: collection.label,
    path: collection.basePath,
  };

  /* ---------------------------------------------------------------- detail */

  async function generateStaticParams() {
    return getDocs(id).map((doc) => ({ slug: doc.slug }));
  }

  async function generateMetadata({ params }: SlugParams): Promise<Metadata> {
    const { slug } = await params;
    const doc = getDoc(id, slug);
    return doc ? docMetadata(doc) : {};
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
    const categories = collection.categoryPages ? getCategories(id) : [];

    return (
      <ListingPage
        trail={[homeCrumb, collectionCrumb]}
        title={collection.title}
        description={collection.description}
        docs={getSummaries(id)}
      >
        {categories.length > 1 ? (
          <TaxonomyLinks
            className="mt-8"
            items={categories.map((category) => ({
              label: `${category.name} (${category.count})`,
              href: `${collection.basePath}/category/${category.slug}`,
            }))}
          />
        ) : null}
      </ListingPage>
    );
  }

  /* -------------------------------------------------------------- category */

  async function generateCategoryParams() {
    if (!collection.categoryPages) return [];
    return getCategories(id).map((category) => ({ category: category.slug }));
  }

  async function generateCategoryMetadata({
    params,
  }: CategoryParams): Promise<Metadata> {
    const { category } = await params;
    const docs = getDocsByCategory(id, category);
    if (!docs.length) return {};
    const name = getCategoryName(id, category);

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

    const name = getCategoryName(id, category);

    return (
      <ListingPage
        trail={[
          homeCrumb,
          collectionCrumb,
          { name, path: `${collection.basePath}/category/${category}` },
        ]}
        eyebrow={collection.label}
        title={name}
        description={`${docs.length} published.`}
        docs={docs.map(toSummary)}
      />
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
