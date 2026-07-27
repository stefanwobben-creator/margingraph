import Link from "next/link";

import { slugify } from "@/lib/content/source";
import type { Doc } from "@/lib/content/types";

const formatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function formatDate(value: string): string {
  return formatter.format(new Date(value));
}

/** Date, reading time, author and — when it differs — the last update. */
export function DocMeta({ doc }: { doc: Doc }) {
  const { frontmatter } = doc;
  const updated = frontmatter.updated ?? frontmatter.date;
  const wasUpdated = updated !== frontmatter.date;

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-muted-foreground">
      <time dateTime={frontmatter.date}>{formatDate(frontmatter.date)}</time>
      <span aria-hidden>·</span>
      <span>{doc.readingMinutes} min read</span>
      {frontmatter.author ? (
        <>
          <span aria-hidden>·</span>
          <span>{frontmatter.author}</span>
        </>
      ) : null}
      {wasUpdated ? (
        <>
          <span aria-hidden>·</span>
          <span>
            Updated <time dateTime={updated}>{formatDate(updated)}</time>
          </span>
        </>
      ) : null}
    </div>
  );
}

export function TagList({ tags }: { tags: string[] }) {
  if (!tags.length) return null;

  return (
    <ul className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <li key={tag}>
          <Link
            href={`/tags/${slugify(tag)}`}
            className="inline-flex rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-foreground/25 hover:text-foreground"
          >
            {tag}
          </Link>
        </li>
      ))}
    </ul>
  );
}
