import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { DocCard } from "@/components/content/doc-card";
import { Section, SectionHeader } from "@/components/layout/section";
import { getCollection } from "@/lib/content/collections";
import { getSummaries } from "@/lib/content/source";
import type { CollectionId } from "@/lib/content/types";

/**
 * The newest few documents from one collection.
 *
 * Reads straight from /content, so publishing updates the homepage. The label
 * and the destination both come from the collection registry, because the
 * previous version hard-coded the word "guides" against a list of blog posts
 * and a link to /blog, and stayed wrong for as long as nobody hovered it.
 */
export function LatestDocs({
  collection,
  title,
  count = 3,
}: {
  collection: CollectionId;
  title: string;
  count?: number;
}) {
  const { label, basePath } = getCollection(collection);
  const docs = getSummaries(collection).slice(0, count);
  if (!docs.length) return null;

  return (
    <Section id={collection} bordered>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeader eyebrow={label} title={title} />

        <Link
          href={basePath}
          className="flex items-center gap-1.5 text-sm font-medium text-accent-brand hover:opacity-80"
        >
          All {label.toLowerCase()}
          <ArrowRight aria-hidden className="size-4" />
        </Link>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {docs.map((doc) => (
          <DocCard key={doc.slug} doc={doc} />
        ))}
      </div>
    </Section>
  );
}
