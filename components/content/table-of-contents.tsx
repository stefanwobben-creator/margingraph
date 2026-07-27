import { cn } from "@/lib/utils";
import type { Heading } from "@/lib/content/types";

/**
 * Server-rendered, no scroll spy. A table of contents that needs JavaScript to
 * be useful is a liability on 500 pages; plain anchors work everywhere and
 * cost nothing.
 */
export function TableOfContents({ headings }: { headings: Heading[] }) {
  if (headings.length < 3) return null;

  return (
    <nav aria-labelledby="toc-heading" className="text-sm">
      <p
        id="toc-heading"
        className="font-mono text-xs tracking-widest text-muted-foreground uppercase"
      >
        On this page
      </p>
      <ol className="mt-4 space-y-2.5 border-l border-border">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={cn(
                "-ml-px block border-l border-transparent py-0.5 text-muted-foreground transition-colors hover:border-accent-brand hover:text-foreground",
                heading.depth === 2 ? "pl-4" : "pl-7",
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
