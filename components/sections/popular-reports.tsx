import { DocCard } from "@/components/content/doc-card";
import { Section, SectionHeader } from "@/components/layout/section";
import { getSummaries } from "@/lib/content/source";

/**
 * Reads straight from /content — publishing a decision page adds a card here.
 * There is no second catalogue to keep in sync.
 */
export function PopularReports() {
  const decisions = getSummaries("decisions");
  if (!decisions.length) return null;

  return (
    <Section id="reports" bordered>
      <SectionHeader
        eyebrow="Reports"
        title="Popular reports"
        description="One question, one report, one price. Upload the file you already have and get an answer you can act on."
      />

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {decisions.map((decision) => (
          <DocCard key={decision.slug} doc={decision} />
        ))}
      </div>
    </Section>
  );
}
