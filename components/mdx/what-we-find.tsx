import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MINIMUM_WORTH, REPORT_PRICE } from "@/lib/reports/findings";
import {
  DEMO_COMPANY,
  demoLines,
  demoReport,
  demoTeaser,
} from "@/lib/reports/samples/example-findings";

const money = (amount: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);

/**
 * Both halves of the flow, on a page where somebody is deciding.
 *
 * This was its own page, /what-we-find, reachable from a nav item and a
 * secondary button. That put the single most persuasive thing on the site one
 * click away from the thing it was persuading you to buy, and gave a visitor
 * who had already found the report a reason to leave it.
 *
 * A report page should answer "what will you actually find in mine", so it
 * answers it in place. Deliberately not a mock-up: both panels are the return
 * values of `teaser()` and `render()` on a real set of management accounts, so
 * if a rule changes this changes with it.
 */
export function WhatWeFind() {
  const teaser = demoTeaser();
  const report = demoReport();
  const lines = demoLines();

  return (
    <section className="not-prose my-12 space-y-6">
      <Card className="gap-0 p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-sm font-medium tracking-widest text-muted-foreground uppercase">
            What was in the file
          </h3>
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

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="gap-0 p-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-medium tracking-widest text-muted-foreground uppercase">
              Free
            </h3>
            <Badge>€0</Badge>
          </div>
          <pre className="mt-4 overflow-x-auto text-[13px] leading-relaxed whitespace-pre-wrap">
            {teaser.text}
          </pre>
          <p className="mt-4 text-sm text-muted-foreground">
            What their business looks like, and the size and subjects of what we
            found. Which line each one sits on, the arithmetic and what to do
            about it is what you are buying.
          </p>
        </Card>

        <Card className="gap-0 p-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-medium tracking-widest text-muted-foreground uppercase">
              Unlocked
            </h3>
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
      </div>

      <Card className="gap-0 p-6">
        <h3 className="text-base font-semibold">
          When we find nothing, there is no payment screen
        </h3>
        <p className="mt-3 text-sm text-muted-foreground">
          This is the part that keeps the rest honest. An engine obliged to
          produce something will produce something. Because a thin result costs
          us nothing to report, the engine is free to say a file is clean.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-md bg-muted p-4 text-[13px] leading-relaxed whitespace-pre-wrap">
          {`We read it looking for money you are leaving behind, and found €0.

That is below the €${MINIMUM_WORTH} we hold ourselves to, so there is nothing to sell
you and nothing to pay. If you want, send a different file.`}
        </pre>
        <p className="mt-4 text-sm text-muted-foreground">
          No refund is ever processed, because no money moved. The guarantee is
          the order of operations rather than a policy. Before any of it runs,
          every subtotal in the file is added up and compared with what it says:
          if the arithmetic closes we read it correctly, and if it does not we
          name the cell rather than quietly deciding what you meant.{" "}
          <Link href="/send" className="underline underline-offset-4">
            See what to send
          </Link>
          .
        </p>
      </Card>
    </section>
  );
}
