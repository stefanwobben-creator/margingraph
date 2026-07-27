import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Card } from "@/components/ui/card";
import type { Report } from "@/lib/reports";
import { routes } from "@/lib/routes";

/**
 * A single report in the catalogue. The whole card is one link target —
 * the arrow row is a visual affordance, not a second tab stop.
 */
export function ReportCard({ report }: { report: Report }) {
  return (
    <Card className="group relative gap-0 p-6 transition-colors hover:border-foreground/20">
      <h3 className="text-base font-medium">
        <Link
          href={routes.report(report.slug)}
          className="after:absolute after:inset-0 focus-visible:outline-none"
        >
          {report.title}
        </Link>
      </h3>

      <p className="mt-2.5 text-sm text-muted-foreground">
        {report.description}
      </p>

      <div className="mt-6 flex items-center justify-between pt-5 border-t border-border">
        <span className="font-mono text-sm tabular-nums">€{report.price}</span>
        <span className="flex items-center gap-1.5 text-sm font-medium text-accent-brand">
          Generate Report
          <ArrowRight
            aria-hidden
            className="size-4 transition-transform group-hover:translate-x-0.5"
          />
        </span>
      </div>
    </Card>
  );
}
