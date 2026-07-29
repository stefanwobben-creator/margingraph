import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Section, SectionHeader } from "@/components/layout/section";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MINIMUM_WORTH, REPORT_PRICE } from "@/lib/reports/findings";
import {
  DEMO_COMPANY,
  demoLines,
  demoReport,
  demoTeaser,
} from "@/lib/reports/samples/example-findings";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "What we find, before you pay for it",
  description:
    "The same engine, on a real company's management accounts. The free half is on the left, what €9 unlocks is on the right. Nothing here was written by hand.",
  alternates: { canonical: "/what-we-find" },
};

const money = (amount: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);

/**
 * Both halves of the flow, generated at build time by the shipped code.
 *
 * Deliberately not a mock-up. The two panels below are the return values of
 * `teaser()` and `render()` on a real set of management accounts, so if a rule
 * changes, this page changes with it. A demo that can drift away from the
 * product is a demo that will.
 */
export default function WhatWeFindPage() {
  const teaser = demoTeaser();
  const report = demoReport();
  const lines = demoLines();

  return (
    <>
      <Section>
        <SectionHeader
          as="h1"
          eyebrow="The flow"
          title="What we find, before you pay for it"
          description={`We read the file and run the analysis first. You see the total, how many findings there are and what each one is about, before anything is for sale. If the total comes in under €${MINIMUM_WORTH}, no payment screen appears at all.`}
        />

        <Card className="mt-10 gap-0 p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-sm font-medium tracking-widest text-muted-foreground uppercase">
              What was in the file
            </h2>
            <Badge variant="secondary">{DEMO_COMPANY.name}</Badge>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{DEMO_COMPANY.note}</p>

          <table className="mt-5 w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2 font-normal">Line</th>
                <th className="py-2 text-right font-normal">2026 trend</th>
                <th className="py-2 text-right font-normal">2026 budget</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line) => (
                <tr key={line.label} className="border-b border-dashed last:border-0">
                  <td className="py-1.5">{line.label}</td>
                  <td className="py-1.5 text-right tabular-nums">{money(line.actual)}</td>
                  <td className="py-1.5 text-right tabular-nums text-muted-foreground">
                    {money(line.budget)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="mt-5 text-sm text-muted-foreground">
            Seven lines. No cleaning, no template, no questionnaire. Everything
            below was produced from this table by the code that ships.
          </p>
        </Card>
      </Section>

      <Section>
        <Container className="grid gap-6 lg:grid-cols-2">
          <Card className="gap-0 p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-medium tracking-widest text-muted-foreground uppercase">
                Free
              </h2>
              <Badge>€0</Badge>
            </div>
            <pre className="mt-4 overflow-x-auto text-[13px] leading-relaxed whitespace-pre-wrap">
              {teaser.text}
            </pre>
            <p className="mt-4 text-sm text-muted-foreground">
              The size and the subjects, not the answers. Which line each one
              sits on, the arithmetic behind it and what to do about it is what
              you are buying. You can check the method here, on a company that
              is not yours, for nothing.
            </p>
          </Card>

          <Card className="gap-0 p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-medium tracking-widest text-muted-foreground uppercase">
                Unlocked
              </h2>
              <Badge variant="secondary">€{REPORT_PRICE}</Badge>
            </div>
            <pre className="mt-4 overflow-x-auto text-[13px] leading-relaxed whitespace-pre-wrap">
              {report.text}
            </pre>
            <p className="mt-4 text-sm text-muted-foreground">
              Note the steps. A recovery rate of 55% is a price your customers
              accepted, not an oversight, so the advice is not to jump to full
              recovery. It is the smallest move worth making, what it earns, and
              how much business it can cost before it stops being worth it.
            </p>
          </Card>
        </Container>
      </Section>

      <Section>
        <Container>
          <Card className="gap-0 p-6">
            <h2 className="text-lg font-semibold">
              When we find nothing, there is no payment screen
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              This is the part that keeps the rest honest. An engine obliged to
              produce something will produce something. Because a thin result
              costs us nothing to report, the engine is free to say a file is
              clean.
            </p>
            <pre className="mt-4 overflow-x-auto rounded-md bg-muted p-4 text-[13px] leading-relaxed whitespace-pre-wrap">
              {`We read your file and found €0.

That is below the €${MINIMUM_WORTH} we hold ourselves to, so there is nothing to sell
you and nothing to pay. If you want, send a different file.`}
            </pre>
            <p className="mt-4 text-sm text-muted-foreground">
              No refund is ever processed, because no money moved. The guarantee
              is the order of operations rather than a policy.
            </p>
          </Card>
        </Container>
      </Section>

      <Section>
        <Container className="text-sm text-muted-foreground">
          <p>
            Before any of this runs, every subtotal in the file is added up and
            compared with what it says. If the arithmetic closes, we read it
            correctly; if it does not, we name the cell rather than quietly
            deciding what you meant. That check is deterministic and has been run
            over twenty-two filed sets of statutory accounts.{" "}
            <Link href={routes.send} className="underline underline-offset-4">
              See what to send
            </Link>
            .
          </p>
        </Container>
      </Section>
    </>
  );
}
