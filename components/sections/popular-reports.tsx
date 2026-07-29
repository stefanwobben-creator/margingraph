import { DocCard } from "@/components/content/doc-card";
import { Section, SectionHeader } from "@/components/layout/section";
import { getSummaries } from "@/lib/content/source";
import { BUNDLE_PRICE, BUNDLE_SIZE, REPORT_PRICE } from "@/lib/reports/findings";

/**
 * Reads straight from /content — publishing a decision page adds a card here.
 * There is no second catalogue to keep in sync.
 */
export function PopularReports() {
  const decisions = getSummaries("reports");
  if (!decisions.length) return null;

  return (
    <Section id="reports" bordered>
      <SectionHeader
        eyebrow="Reports"
        title="Popular reports"
        description={`One question, one report, one price. Send the file you already have, see what is in it, and decide afterwards. €${REPORT_PRICE} each, or any ${BUNDLE_SIZE} from the same file for €${BUNDLE_PRICE}.`}
      />

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {decisions.map((decision) => (
          <DocCard key={decision.slug} doc={decision} />
        ))}
      </div>
    </Section>
  );
}
