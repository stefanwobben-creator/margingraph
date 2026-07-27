import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { GuideCard } from "@/components/guide-card";
import { Section, SectionHeader } from "@/components/layout/section";
import { guides } from "@/lib/guides";
import { routes } from "@/lib/routes";

export function LatestGuides() {
  return (
    <Section id="guides" bordered>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeader eyebrow="Guides" title="Latest decision guides" />

        <Link
          href={routes.guides}
          className="flex items-center gap-1.5 text-sm font-medium text-accent-brand hover:opacity-80"
        >
          All guides
          <ArrowRight aria-hidden className="size-4" />
        </Link>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {guides.slice(0, 3).map((guide) => (
          <GuideCard key={guide.slug} guide={guide} />
        ))}
      </div>
    </Section>
  );
}
