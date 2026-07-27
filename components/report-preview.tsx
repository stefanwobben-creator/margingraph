import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const drivers = [
  { label: "Overdue receivables", effect: "+0.8 months", direction: "up" },
  { label: "Stock ordered but unsold", effect: "−1.4 months", direction: "down" },
  { label: "Fixed costs, unchanged", effect: "no effect", direction: "flat" },
] as const;

const icons = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  flat: Minus,
} as const;

/**
 * Illustrative product preview used in the hero. Static by design — it shows
 * the shape of a report, not real figures, and is labelled as an example.
 */
export function ReportPreview({ className }: { className?: string }) {
  return (
    <Card
      id="example-report"
      aria-label="Example decision report"
      className={cn(
        "scroll-mt-24 gap-0 overflow-hidden p-0 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-12px_rgba(0,0,0,0.12)]",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-4 px-6 pt-6 pb-5">
        <div>
          <p className="text-xs tracking-widest text-muted-foreground uppercase">
            Decision report
          </p>
          <p className="mt-1.5 font-medium">Cash Runway</p>
        </div>
        <Badge variant="secondary" className="shrink-0">
          Example
        </Badge>
      </div>

      <Separator />

      <div className="px-6 py-7">
        <p className="text-sm text-muted-foreground">
          How long does the cash last?
        </p>
        <p className="mt-2 flex items-baseline gap-2">
          <span className="text-title tabular-nums">7.4</span>
          <span className="text-muted-foreground">months</span>
        </p>

        <div
          className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-muted"
          role="presentation"
        >
          <div className="h-full w-[46%] rounded-full bg-accent-brand" />
        </div>
        <div className="mt-2.5 flex justify-between font-mono text-xs text-muted-foreground">
          <span>Today</span>
          <span>Runs out · March 2027</span>
        </div>
      </div>

      <Separator />

      <div className="px-6 py-6">
        <p className="text-sm font-medium">What moves the date</p>
        <ul className="mt-4 space-y-3.5">
          {drivers.map((driver) => {
            const Icon = icons[driver.direction];
            return (
              <li
                key={driver.label}
                className="flex items-center justify-between gap-4 text-sm"
              >
                <span className="flex min-w-0 items-center gap-2.5 text-muted-foreground">
                  <Icon aria-hidden className="size-4 shrink-0" />
                  <span className="truncate">{driver.label}</span>
                </span>
                <span className="shrink-0 font-mono text-xs tabular-nums">
                  {driver.effect}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <Separator />

      <p className="bg-muted/40 px-6 py-4 font-mono text-xs text-muted-foreground">
        14 inputs · 4 assumptions · every figure traced to a cell
      </p>
    </Card>
  );
}
