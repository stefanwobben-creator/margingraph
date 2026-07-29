import { AlertTriangle, ArrowRight, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const range = [
  { label: "Low", value: "€1.9M", amount: 1.9 },
  { label: "Expected", value: "€2.4M", amount: 2.4, emphasis: true },
  { label: "High", value: "€3.1M", amount: 3.1 },
];

const [low, expected, high] = range;
/** Where Expected sits between Low and High, as a percentage. */
const EXPECTED_POSITION = Math.round(
  ((expected.amount - low.amount) / (high.amount - low.amount)) * 100,
);

const drivers = [
  "Recurring revenue at 68% of turnover, up from 51% two years ago",
  "Gross margin two points above the sector median for this size",
  "Owner salary below market rate — normalised, this lowers EBITDA by €45k",
];

const risks = [
  "Largest customer is 31% of revenue, on a contract renewing in eleven months",
  "No second signatory on supplier relationships; continuity rests on one person",
  "Working capital rose faster than revenue in the last two years",
];

const nextSteps = [
  "Document the customer concentration mitigation before entering talks",
  "Restate owner compensation at market rate in the figures you present",
  "Get a second view on the discount rate — it moves the range by €400k",
];

/**
 * Illustrative output for the business valuation report. Static, fictional,
 * and labelled as an example — it shows the shape of the document, not a
 * result for any real company.
 */
export function BusinessValuationPreview() {
  return (
    <Card className="gap-0 overflow-hidden p-0">
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-6 sm:px-8">
        <div>
          <p className="text-xs tracking-widest text-muted-foreground uppercase">
            Report
          </p>
          <p className="mt-1.5 font-medium">Business Valuation</p>
        </div>
        <Badge variant="secondary">Example — fictional figures</Badge>
      </div>

      <Separator />

      <div className="px-6 py-8 sm:px-8">
        <p className="text-sm text-muted-foreground">Estimated valuation</p>

        <dl className="mt-6 grid gap-6 sm:grid-cols-3">
          {range.map((item) => (
            <div key={item.label}>
              <dt className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
                {item.label}
              </dt>
              <dd
                className={
                  item.emphasis
                    ? "mt-2 text-title tabular-nums"
                    : "mt-2 text-heading text-muted-foreground tabular-nums"
                }
              >
                {item.value}
              </dd>
            </div>
          ))}
        </dl>

        {/*
          The track spans Low (€1.9M) to High (€3.1M); the marker sits where
          Expected (€2.4M) actually falls in that range — 42%. If the figures
          change, the marker must change with them.
        */}
        <div className="relative mt-8 h-1.5 w-full rounded-full bg-muted">
          <div
            className="absolute top-1/2 h-3.5 w-0.5 -translate-y-1/2 rounded-full bg-accent-brand"
            style={{ left: `${EXPECTED_POSITION}%` }}
            role="presentation"
          />
        </div>
        <p className="mt-3 font-mono text-xs text-muted-foreground">
          Multiple €2.2M · DCF €2.7M · Asset-based €1.9M (floor)
        </p>
      </div>

      <Separator />

      <div className="grid gap-px bg-border sm:grid-cols-3">
        <PreviewBlock
          icon={<TrendingUp aria-hidden className="size-4" />}
          title="Key drivers"
          items={drivers}
        />
        <PreviewBlock
          icon={<AlertTriangle aria-hidden className="size-4" />}
          title="Biggest risks"
          items={risks}
        />
        <PreviewBlock
          icon={<ArrowRight aria-hidden className="size-4" />}
          title="Suggested next steps"
          items={nextSteps}
        />
      </div>

      <Separator />

      <p className="bg-muted/40 px-6 py-4 font-mono text-xs text-muted-foreground sm:px-8">
        3 methods · 11 assumptions stated · every figure traced to a source line
      </p>
    </Card>
  );
}

function PreviewBlock({
  icon,
  title,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
}) {
  return (
    <div className="bg-card px-6 py-7 sm:px-8">
      <h3 className="flex items-center gap-2.5 text-sm font-medium">
        <span className="text-muted-foreground">{icon}</span>
        {title}
      </h3>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li
            key={item}
            className="text-sm leading-relaxed text-muted-foreground"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
