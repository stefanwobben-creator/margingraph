import Link from "next/link";

import { Logo } from "@/components/brand/wordmark";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import { site } from "@/lib/site";

/**
 * Every content section is reachable from here. A collection with fifty pages
 * and no entry in the navigation is fifty pages that only a sitemap can find.
 */
/**
 * Four items, not seven.
 *
 * "Reports", "What we find", "Guides", "Blog" and "FAQ" asked a visitor to
 * work out the difference between four kinds of writing before they could look
 * for anything. Blog and guides were the same thing, and what we find was part
 * of a report. What is left is the shape of the business: what you can buy,
 * what you can learn for free, the questions, and who we are.
 */
const nav = [
  { label: "Reports", href: routes.reports },
  { label: "Guides", href: routes.guides },
  { label: "FAQ", href: routes.faq },
  { label: "About", href: routes.about },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/85 backdrop-blur-sm supports-[backdrop-filter]:bg-background/70">
      <Container className="flex h-16 items-center justify-between gap-6">
        <Link
          href="/"
          aria-label={`${site.name} home`}
          className="text-[17px] transition-opacity hover:opacity-70"
        >
          <Logo />
        </Link>

        <nav aria-label="Main" className="flex items-center gap-4">
          <ul className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
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
            <Link href={routes.send}>Send a file</Link>
          </Button>

          {/*
            Below 768px the navigation was hidden and nothing replaced it, so
            the entire site was unreachable from a phone except through the
            footer. A details element does this with no JavaScript, no client
            component and no hydration: it is a disclosure widget, which is
            exactly what a menu is.
          */}
          <details className="group relative md:hidden">
            <summary
              aria-label="Menu"
              className="flex size-9 cursor-pointer list-none items-center justify-center rounded-md border border-border [&::-webkit-details-marker]:hidden"
            >
              <span aria-hidden className="space-y-1">
                <span className="block h-px w-4 bg-foreground" />
                <span className="block h-px w-4 bg-foreground" />
                <span className="block h-px w-4 bg-foreground" />
              </span>
            </summary>
            <ul className="absolute right-0 z-50 mt-2 w-56 rounded-lg border border-border bg-background p-2 text-sm shadow-lg">
              {nav.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="block rounded-md px-3 py-2.5 hover:bg-muted"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        </nav>
      </Container>
    </header>
  );
}
