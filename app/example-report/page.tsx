import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Section, SectionHeader } from "@/components/layout/section";
import { ReportView } from "@/components/reports/report-view";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  buildExampleReport,
  EXAMPLE_BUSINESS,
  exampleInputs,
} from "@/lib/reports/samples/example-business";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "An example valuation report",
  description:
    "A complete report on an invented business, produced by the same engine that reads your file. Every figure traced to a source, every assumption on the page.",
  alternates: { canonical: "/example-report" },
};

const FIGURES: [string, number][] = [
  ["Revenue", exampleInputs.revenue.amount],
  ["EBITDA as reported", exampleInputs.ebitda.amount],
  ["Owner's own remuneration", exampleInputs.ownerRemuneration.amount],
  ["One-off costs identified", exampleInputs.oneOffCosts?.amount ?? 0],
  ["Net assets", exampleInputs.netAssets.amount],
  ["Cash", exampleInputs.cash.amount],
  ["Interest-bearing debt", exampleInputs.interestBearingDebt.amount],
];

const money = (amount: number) =>
  new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);

export default async function ExampleReportPage() {
  const report = await buildExampleReport();

  return (
    <>
      <Section>
        <SectionHeader
          as="h1"
          eyebrow="Example"
          title={report.title}
          description={`${EXAMPLE_BUSINESS.name}. ${EXAMPLE_BUSINESS.description} The business is invented; everything below it is not. The same analyzer, the same market data and the same reasoning engine that read your file produced this page.`}
        />

        <Card className="mt-10 gap-0 p-6">
          <h2 className="text-sm font-medium tracking-widest text-muted-foreground uppercase">
            What was in the file
          </h2>
          <dl className="mt-4 grid gap-x-8 gap-y-2 sm:grid-cols-2">
            {FIGURES.map(([label, amount]) => (
              <div key={label} className="flex justify-between gap-4 text-sm">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="tabular-nums">{money(amount)}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 text-sm text-muted-foreground">
            Financial year {exampleInputs.period}. Nothing else was supplied, and
            nothing else was assumed without saying so below.
          </p>
        </Card>
      </Section>

      <Section bordered>
        <Container width="prose" className="px-0 sm:px-0">
          <ReportView report={report} />
        </Container>
      </Section>

      <Section bordered>
        <Card className="gap-0 p-8">
          <h2 className="text-heading text-balance">
            The same thing, on your figures
          </h2>
          <p className="mt-3 text-muted-foreground">
            Send your P&amp;L and balance sheet. We read them, run the analysis and
            show you what we found before anything is for sale, with every number
            traced back to a line in your file.
          </p>
          <div className="mt-6">
            <Button asChild>
              <Link href={routes.send}>Send a file</Link>
            </Button>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Not ready? The{" "}
            <Link href={routes.guides} className="underline underline-offset-4">
              guides
            </Link>{" "}
            walk through the same calculations by hand, for free.
          </p>
        </Card>
      </Section>
    </>
  );
}
