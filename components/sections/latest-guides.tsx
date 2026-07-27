import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { DocCard } from "@/components/content/doc-card";
import { Section, SectionHeader } from "@/components/layout/section";
import { getSummaries } from "@/lib/content/source";
import { routes } from "@/lib/routes";

/** Reads straight from /content — publishing a post updates the homepage. */
export function LatestGuides() {
  const posts = getSummaries("blog").slice(0, 3);
  if (!posts.length) return null;

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
        {posts.map((post) => (
          <DocCard key={post.slug} doc={post} />
        ))}
      </div>
    </Section>
  );
}
