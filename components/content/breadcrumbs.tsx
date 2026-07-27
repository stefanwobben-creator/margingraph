import Link from "next/link";

export type Crumb = { name: string; path: string };

/** Visible breadcrumb. The JSON-LD version is emitted separately from the same trail. */
export function Breadcrumbs({ trail }: { trail: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-2">
        {trail.map((crumb, index) => {
          const isLast = index === trail.length - 1;
          return (
            <li key={crumb.path} className="flex items-center gap-2">
              {isLast ? (
                <span className="text-foreground">{crumb.name}</span>
              ) : (
                <>
                  <Link href={crumb.path} className="hover:text-foreground">
                    {crumb.name}
                  </Link>
                  <span aria-hidden>/</span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
