import Link from "next/link";

import { Container } from "@/components/layout/container";
import { site } from "@/lib/site";

/**
 * Global header. Intentionally has no navigation yet — links are added
 * as sections are built, so the header never points at a page that
 * does not exist.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/85 backdrop-blur-sm supports-[backdrop-filter]:bg-background/70">
      <Container className="flex h-16 items-center justify-between">
        <Link
          href="/"
          className="text-[15px] font-semibold tracking-tight text-foreground transition-opacity hover:opacity-70"
        >
          {site.name}
        </Link>

        <nav aria-label="Main" className="flex items-center gap-6 text-sm">
          {/* Navigation items are added per section. */}
        </nav>
      </Container>
    </header>
  );
}
