import type { TemplateDefinition } from "../contracts";
import type { ReportManifest } from "../manifest/manifest";
import type { Assessment, ConfidenceBand } from "../types/assessment";
import type { Claim } from "../types/claim";
import type { ClaimSet } from "../types/claim-set";
import type { Report, ReportChapter } from "../types/report";

const BAND_ORDER: Record<ConfidenceBand, number> = {
  insufficient: 0,
  low: 1,
  moderate: 2,
  high: 3,
};

function matches(claim: Claim, select: { tags?: string[]; metrics?: string[] }) {
  const byTag = select.tags?.some((tag) => claim.tags?.includes(tag)) ?? false;
  const byMetric = select.metrics?.includes(claim.metric) ?? false;
  return byTag || byMetric;
}

/**
 * Turns claims plus an assessment into a report, following a template.
 *
 * Structural only. It selects and orders; it does not write, format or
 * calculate. Everything it needs from the template is data, which is what
 * makes "a new report is configuration" true rather than aspirational.
 *
 * A claim can appear in more than one chapter if a template selects it twice.
 * That is the template's decision and the composer does not second-guess it.
 */
export function compose(input: {
  reportId: string;
  template: TemplateDefinition;
  claimSet: ClaimSet;
  assessment: Assessment;
  manifest: ReportManifest;
}): Report {
  const { template, claimSet, assessment } = input;

  const confidenceById = new Map(
    assessment.confidence.map((entry) => [entry.claimId, entry]),
  );

  const floor = template.minimumBand ? BAND_ORDER[template.minimumBand] : -1;

  const chapters: ReportChapter[] = template.chapters.map((definition) => {
    const claims = claimSet.claims
      .filter((claim) => matches(claim, definition.select))
      .map((claim) => ({ claim, confidence: confidenceById.get(claim.id) }))
      // A claim the engine never assessed cannot be shown; that would be a
      // figure without a confidence, which is the thing this platform exists
      // not to produce.
      .filter(
        (entry): entry is { claim: Claim; confidence: NonNullable<typeof entry.confidence> } =>
          entry.confidence !== undefined,
      )
      .filter((entry) => BAND_ORDER[entry.confidence.band] >= floor)
      .sort((a, b) => b.confidence.score - a.confidence.score);

    return {
      id: definition.id,
      title: definition.title,
      claims,
      emptyText: claims.length === 0 ? definition.emptyText : undefined,
    };
  });

  return {
    id: input.reportId,
    title: template.title,
    chapters,
    assessment,
    claimSet,
    manifest: input.manifest,
  };
}
