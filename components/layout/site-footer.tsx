import Link from "next/link";

import { LogoMark } from "@/components/brand/logo-mark";
import { Container } from "@/components/layout/container";
import { collectionList } from "@/lib/content/collections";
import { site } from "@/lib/site";

/**
 * The footer carries the same destinations as the header, and it is the only
 * navigation below the `md` breakpoint, where the header list is hidden. Built
 * from the collection registry so a new content type appears here on its own.
 */
const links = collectionList.map((collection) => ({
  label: collection.label,
  href: collection.basePath,
}));

/**
 * Not derived from anything, because these are not content.
 *
 * The footer is where a buyer looks for them before deciding whether a site
 * that wants their profit and loss is real, so they sit in the same row as
 * everything else rather than in small grey type underneath.
 */
const legal = [
  { label: "The idea", href: "/idea" },
  { label: "For companies that ship things", href: "/for/ecommerce" },
  { label: "About", href: "/about" },
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
  { label: "Processing agreement", href: "/dpa" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border/80 py-10">
      <Container className="flex flex-col gap-6">
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {[...links, ...legal].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2">
            <LogoMark className="size-4" />© {new Date().getFullYear()}{" "}
            {site.name}
          </p>
          <p className="text-balance">{site.tagline}</p>
        </div>
      </Container>
    </footer>
  );
}
