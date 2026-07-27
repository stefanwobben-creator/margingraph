import Link from "next/link";

import { formatDate } from "@/components/content/doc-meta";
import { Card } from "@/components/ui/card";
import { getCollection } from "@/lib/content/collections";
import type { DocSummary } from "@/lib/content/types";

/** The listing unit. Used on index, category, tag and related sections. */
export function DocCard({
  doc,
  showCollection = false,
}: {
  doc: DocSummary;
  showCollection?: boolean;
}) {
  return (
    <Card className="group relative gap-0 p-6 transition-colors hover:border-foreground/20">
      <p className="flex flex-wrap items-center gap-2 font-mono text-xs text-muted-foreground">
        {showCollection ? (
          <>
            <span>{getCollection(doc.collection).labelSingular}</span>
            <span aria-hidden>·</span>
          </>
        ) : null}
        <time dateTime={doc.date}>{formatDate(doc.date)}</time>
        <span aria-hidden>·</span>
        <span>{doc.readingMinutes} min</span>
      </p>

      <h3 className="mt-3 text-base font-medium text-balance">
        <Link
          href={doc.href}
          className="after:absolute after:inset-0 focus-visible:outline-none"
        >
          {doc.title}
        </Link>
      </h3>

      <p className="mt-2.5 text-sm text-muted-foreground">{doc.description}</p>
    </Card>
  );
}
