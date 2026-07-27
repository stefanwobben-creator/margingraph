import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import { site } from "@/lib/site";

const nav = [
  { label: "Reports", href: routes.reports },
  { label: "How it works", href: routes.howItWorks },
  { label: "Guides", href: routes.guides },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/85 backdrop-blur-sm supports-[backdrop-filter]:bg-background/70">
      <Container className="flex h-16 items-center justify-between gap-6">
        <Link
          href="/"
          className="text-[15px] font-semibold tracking-tight transition-opacity hover:opacity-70"
        >
          {site.name}
        </Link>

        <nav aria-label="Main" className="flex items-center gap-6">
          <ul className="hidden items-center gap-6 text-sm text-muted-foreground sm:flex">
            {nav.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <Button asChild size="sm">
            <Link href={routes.reports}>Browse Reports</Link>
          </Button>
        </nav>
      </Container>
    </header>
  );
}
