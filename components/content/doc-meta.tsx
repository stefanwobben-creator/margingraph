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
