import Link from "next/link";

import { Card } from "@/components/ui/card";
import type { Guide } from "@/lib/guides";
import { routes } from "@/lib/routes";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function GuideCard({ guide }: { guide: Guide }) {
  return (
    <Card className="group relative gap-0 p-6 transition-colors hover:border-foreground/20">
      <p className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
        <time dateTime={guide.published}>
          {dateFormatter.format(new Date(guide.published))}
        </time>
        <span aria-hidden>·</span>
        <span>{guide.readingMinutes} min read</span>
      </p>

      <h3 className="mt-3 text-base font-medium text-balance">
        <Link
          href={routes.guide(guide.slug)}
          className="after:absolute after:inset-0 focus-visible:outline-none"
        >
          {guide.title}
        </Link>
      </h3>

      <p className="mt-2.5 text-sm text-muted-foreground">{guide.summary}</p>
    </Card>
  );
}
