import Link from "next/link";

import { Container } from "@/components/layout/container";
import { ReportPreview } from "@/components/report-preview";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

export function Hero() {
  return (
    <section className="py-20 sm:py-28 lg:py-32">
      <Container className="grid items-center gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-20">
        <div>
          <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
            Upload · Analyze · Decide
          </p>

          <h1 className="mt-6 text-display text-balance">
            Every important business decision starts with one question.
          </h1>

          <p className="mt-6 max-w-xl text-lead text-muted-foreground">
            Upload your spreadsheet, financial report or document. MarginGraph
            analyzes your data and generates a decision report in minutes.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg">
              <Link href={routes.reports}>Browse Reports</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={routes.exampleReport}>See Example Report</Link>
            </Button>
          </div>
        </div>

        <ReportPreview className="w-full lg:justify-self-end" />
      </Container>
    </section>
  );
}
