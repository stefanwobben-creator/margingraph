import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import type { ReportPage } from "@/lib/report-page";

export function ReportHero({ report }: { report: ReportPage }) {
  return (
    <section className="py-16 sm:py-24">
      <Container>
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/" className="hover:text-foreground">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="text-foreground">{report.metaTitle}</li>
          </ol>
        </nav>

        <div className="mt-10 max-w-prose-page">
          <h1 className="text-display text-balance">{report.question}</h1>
          <p className="mt-6 text-lead text-muted-foreground">{report.intro}</p>

          <div className="mt-10 flex flex-wrap items-center gap-5">
            <Button asChild size="lg">
              {/* No checkout yet — deliberately inert. */}
              <Link href="#">Generate Report</Link>
            </Button>
            <p className="flex items-baseline gap-2">
              <span className="font-mono text-lg tabular-nums">
                €{report.price}
              </span>
              <span className="text-sm text-muted-foreground">per report</span>
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
