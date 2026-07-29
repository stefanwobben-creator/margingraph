import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  DEMO_COMPANY,
  demoPortrait,
  demoTeaser,
} from "@/lib/reports/samples/example-findings";
import { cn } from "@/lib/utils";

/**
 * The hero preview, produced by the engine rather than drawn.
 *
 * What stood here before was a mock-up of a cash runway report: invented
 * figures, a made-up date, "14 inputs · 4 assumptions", labelled Example and
 * honest about being illustrative. It was still the wrong thing in the hero of
 * a product whose entire argument is that it does not invent numbers. The
 * first thing a visitor saw was the one artefact on the site that nothing
 * generated.
 *
 * This is the same anonymised wholesaler that drives /what-we-find, rendered
 * from `portrait()` at build time. If a rule changes, this changes. A demo
 * that can drift away from the product is a demo that will.
 */
export function ReportPreview({ className }: { className?: string }) {
  const { lines, cascade } = demoPortrait();
  const { found, recommended, count } = demoTeaser();

  const euro = (amount: number) =>
    new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <Card
      id="example-report"
      aria-label="What we found in a real company's accounts"
      className={cn(
        "scroll-mt-24 gap-0 overflow-hidden p-0 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-12px_rgba(0,0,0,0.12)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-5">
        <div className="min-w-0">
          <p className="text-xs tracking-widest text-muted-foreground uppercase">
            A real file, anonymised
          </p>
          <p className="mt-1.5 font-medium">{DEMO_COMPANY.name}</p>
        </div>
        <Badge variant="secondary" className="shrink-0">
          Free half
        </Badge>
      </div>

      <Separator />

      <div className="px-6 py-6">
        <dl className="space-y-2.5">
          {lines.map((line) => (
            <div
              key={line.label}
              className="flex items-baseline justify-between gap-4 text-sm"
            >
              <dt className="min-w-0 text-muted-foreground">{line.label}</dt>
              <dd className="shrink-0 text-right tabular-nums">{line.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {cascade.length > 0 ? (
        <>
          <Separator />
          <div className="px-6 py-6">
            <p className="text-sm font-medium">Of every euro of turnover</p>
            <dl className="mt-4 space-y-2.5">
              {cascade.map((step) => (
                <div
                  key={step.label}
                  className="flex items-baseline justify-between gap-4 text-sm"
                >
                  <dt className="min-w-0 text-muted-foreground">{step.label}</dt>
                  <dd className="shrink-0 text-right tabular-nums">{step.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </>
      ) : null}

      <Separator />

      <p className="bg-muted/40 px-6 py-4 text-xs text-muted-foreground">
        Then: {euro(found)} of exposure across {count}{" "}
        {count === 1 ? "finding" : "findings"}, of which {euro(recommended)} we
        would actually act on. Every figure above was produced by the code that
        would read your file.
      </p>
    </Card>
  );
}
