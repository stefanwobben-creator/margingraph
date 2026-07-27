import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import type { ReportPage } from "@/lib/report-page";

export function ReportCta({ report }: { report: ReportPage }) {
  return (
    <section className="border-t border-border py-24 sm:py-32">
      <Container className="flex flex-col items-start gap-8 sm:items-center sm:text-center">
        <h2 className="max-w-2xl text-title text-balance">{report.question}</h2>
        <Button asChild size="lg">
          {/* No checkout yet — deliberately inert. */}
          <Link href="#">{report.cta}</Link>
        </Button>
        <p className="font-mono text-sm text-muted-foreground tabular-nums">
          €{report.price}
        </p>
      </Container>
    </section>
  );
}
