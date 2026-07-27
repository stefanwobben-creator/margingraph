import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { DocCard } from "@/components/content/doc-card";
import type { DocSummary } from "@/lib/content/types";

/** Previous / next within the same collection. */
export function DocPager({
  previous,
  next,
}: {
  previous?: DocSummary;
  next?: DocSummary;
}) {
  if (!previous && !next) return null;

  return (
    <nav
      aria-label="Document navigation"
      className="mt-16 grid gap-4 border-t border-border pt-8 sm:grid-cols-2"
    >
      {previous ? (
        <Link
          href={previous.href}
          className="group rounded-lg border border-border p-5 transition-colors hover:border-foreground/20"
        >
          <span className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
            <ArrowLeft aria-hidden className="size-3.5" />
            Previous
          </span>
          <span className="mt-2 block font-medium text-balance">
            {previous.title}
          </span>
        </Link>
      ) : (
        <span />
      )}

      {next ? (
        <Link
          href={next.href}
          className="group rounded-lg border border-border p-5 text-right transition-colors hover:border-foreground/20 sm:col-start-2"
        >
          <span className="flex items-center justify-end gap-2 font-mono text-xs text-muted-foreground">
            Next
            <ArrowRight aria-hidden className="size-3.5" />
          </span>
          <span className="mt-2 block font-medium text-balance">
            {next.title}
          </span>
        </Link>
      ) : null}
    </nav>
  );
}

export function RelatedDocs({ docs }: { docs: DocSummary[] }) {
  if (!docs.length) return null;

  return (
    <section aria-labelledby="related-heading" className="mt-16">
      <h2 id="related-heading" className="text-heading">
        Keep reading
      </h2>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {docs.map((doc) => (
          <DocCard key={`${doc.collection}-${doc.slug}`} doc={doc} showCollection />
        ))}
      </div>
    </section>
  );
}
