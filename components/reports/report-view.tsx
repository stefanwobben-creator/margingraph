import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type {
  ConfidenceAssessment,
  ConfidenceBand,
  Counterargument,
  Quantity,
  Report,
} from "@/lib/reports/kernel";
import { cn } from "@/lib/utils";

/**
 * A report, on a page.
 *
 * Presentation only. It reads what the kernel established and shows it; it
 * never computes a value, a band or a score. If a number is wrong here it is
 * wrong upstream, which is where the tests are.
 *
 * The confidence breakdown is shown rather than summarised. A score a reader
 * has to trust is the thing this product exists not to sell.
 */

const BAND_LABEL: Record<ConfidenceBand, string> = {
  high: "Well grounded",
  moderate: "Reasonably grounded",
  low: "Thinly grounded",
  insufficient: "Not grounded",
};

const BAND_STYLE: Record<ConfidenceBand, string> = {
  high: "border-emerald-600/30 text-emerald-700 dark:text-emerald-400",
  moderate: "border-sky-600/30 text-sky-700 dark:text-sky-400",
  low: "border-amber-600/40 text-amber-700 dark:text-amber-500",
  insufficient: "border-red-600/40 text-red-700 dark:text-red-400",
};

function money(amount: number): string {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatQuantity(value: Quantity): string {
  if (value.unit === "EUR") {
    return value.low !== undefined && value.high !== undefined
      ? `${money(value.low)} to ${money(value.high)}`
      : money(value.amount);
  }
  if (value.unit === "%") {
    const pct = (n: number) => `${(n * 100).toFixed(1)}%`;
    return value.low !== undefined && value.high !== undefined
      ? `${pct(value.low)} to ${pct(value.high)}`
      : pct(value.amount);
  }
  if (value.unit === "x") return `${value.amount}×`;
  return `${value.amount}`;
}

function ConfidenceDetail({ confidence }: { confidence: ConfidenceAssessment }) {
  // `assumptionLoad` runs the other way from the rest: 0 means pure evidence
  // and 1 means pure assumption. Printing it raw under a positive label would
  // show a well-grounded claim as 12% and read as the opposite of the truth.
  const rows: [string, number][] = [
    ["Traceable to a source", confidence.components.traceability],
    ["Quality of that source", confidence.components.evidenceQuality],
    ["Free of assumption", 1 - confidence.components.assumptionLoad],
    ["Consistent with the rest", confidence.components.consistency],
  ];

  return (
    <div className="mt-5 border-t border-border/70 pt-4">
      <dl className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
        {rows.map(([label, score]) => (
          <div key={label} className="flex items-baseline justify-between gap-4">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="tabular-nums">{Math.round(score * 100)}%</dd>
          </div>
        ))}
      </dl>
      {confidence.reasons.length > 0 ? (
        <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
          {confidence.reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function Leverage({ counterargument }: { counterargument: Counterargument }) {
  const effect =
    counterargument.effect === "inverts"
      ? "The answer reverses"
      : counterargument.effect === "weakens"
        ? "The answer weakens"
        : "The answer cannot be evaluated";

  return (
    <li className="border-l-2 border-border py-1 pl-4">
      <p className="text-balance">{counterargument.statement}</p>
      <p className="mt-1 text-sm text-muted-foreground">
        {effect} if this is wrong. It carries{" "}
        {Math.round(counterargument.leverage * 100)}% of the report.
      </p>
    </li>
  );
}

export function ReportView({ report }: { report: Report }) {
  const { assessment } = report;
  const byLeverage = [...assessment.counterarguments].sort(
    (a, b) => b.leverage - a.leverage,
  );

  return (
    <article className="space-y-16">
      {report.chapters.map((chapter) => (
        <section key={chapter.id} className="scroll-mt-24" id={chapter.id}>
          <h2 className="text-heading">{chapter.title}</h2>

          {chapter.emptyText ? (
            <p className="mt-4 text-muted-foreground">{chapter.emptyText}</p>
          ) : (
            <div className="mt-6 space-y-5">
              {chapter.claims.map(({ claim, confidence }) => (
                <Card key={claim.id} className="gap-0 p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <p className="text-lead text-balance">{claim.statement}</p>
                    <Badge
                      variant="outline"
                      className={cn("shrink-0", BAND_STYLE[confidence.band])}
                    >
                      {BAND_LABEL[confidence.band]}
                    </Badge>
                  </div>

                  {claim.value ? (
                    <p className="mt-3 text-2xl tabular-nums">
                      {formatQuantity(claim.value)}
                    </p>
                  ) : null}

                  <ConfidenceDetail confidence={confidence} />
                </Card>
              ))}
            </div>
          )}
        </section>
      ))}

      {byLeverage.length > 0 ? (
        <section id="leverage" className="scroll-mt-24">
          <h2 className="text-heading">What would change this answer</h2>
          <p className="mt-3 text-muted-foreground">
            Ordered by how much of the report rests on each one. Argue with the
            top of this list first.
          </p>
          <ul className="mt-6 space-y-4">
            {byLeverage.map((counterargument) => (
              <Leverage
                key={counterargument.assumptionId}
                counterargument={counterargument}
              />
            ))}
          </ul>
        </section>
      ) : null}

      <section id="provenance" className="scroll-mt-24">
        <h2 className="text-heading">Where every figure came from</h2>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-muted-foreground">
              <tr>
                <th className="py-2 pr-4 font-medium">Figure</th>
                <th className="py-2 pr-4 font-medium">Source</th>
                <th className="py-2 font-medium">Quality</th>
              </tr>
            </thead>
            <tbody>
              {report.claimSet.evidence.map((item) => {
                const grade = assessment.evidenceGrades.find(
                  (g) => g.evidenceId === item.id,
                );
                const where =
                  item.provenance.type === "file"
                    ? `${item.provenance.filename}${
                        item.provenance.location.sheet
                          ? ` · ${item.provenance.location.sheet}`
                          : ""
                      }${
                        item.provenance.location.cell
                          ? ` · ${item.provenance.location.cell}`
                          : ""
                      }`
                    : item.provenance.type === "knowledge"
                      ? `${item.provenance.dataset} · ${item.provenance.snapshot}`
                      : item.provenance.type === "derived"
                        ? "Calculated from the figures above"
                        : `You told us: ${item.provenance.field}`;

                return (
                  <tr key={item.id} className="border-b border-border/60 align-top">
                    <td className="py-3 pr-4">{item.statement}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{where}</td>
                    <td className="py-3 tabular-nums text-muted-foreground">
                      {grade ? `${Math.round(grade.quality * 100)}%` : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section id="manifest" className="scroll-mt-24">
        <h2 className="text-heading">How this report was produced</h2>
        <p className="mt-3 text-muted-foreground">
          Recorded so the same figures can be reproduced years from now, with the
          data that was current on the day it was written rather than today&apos;s.
        </p>
        <dl className="mt-6 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
          {[
            ["Report", report.manifest.reportId],
            ["Generated", report.manifest.generatedAt],
            [
              "Method",
              `${report.manifest.analyzer.id} ${report.manifest.analyzer.version}`,
            ],
            [
              "Template",
              `${report.manifest.template.id} ${report.manifest.template.version}`,
            ],
            ...Object.entries(report.manifest.knowledge).map(
              ([name, snapshot]): [string, string] => [
                "Market data",
                `${name} · ${snapshot}`,
              ],
            ),
          ].map(([label, value]) => (
            <div key={`${label}-${value}`} className="flex justify-between gap-4">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="text-right">{value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </article>
  );
}
