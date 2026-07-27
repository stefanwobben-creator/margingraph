import Link from "next/link";

import { cn } from "@/lib/utils";

/** Pill links. Used for both tags and categories — they render identically. */
export function TaxonomyLinks({
  items,
  className,
}: {
  items: { label: string; href: string }[];
  className?: string;
}) {
  if (!items.length) return null;

  return (
    <ul className={cn("flex flex-wrap gap-2", className)}>
      {items.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            className="inline-flex rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-foreground/25 hover:text-foreground"
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
