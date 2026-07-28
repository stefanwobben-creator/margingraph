import { createEvidence, type Evidence, type KnowledgeSource } from "@/lib/reports/kernel";

/**
 * Versioned reference data for the valuation domain.
 *
 * Two rules govern what is allowed in here, and they are the reason this file
 * is short.
 *
 * **Everything carries a published source.** If we cannot point at a document,
 * it is not knowledge and it does not belong here. It becomes an assumption in
 * the analyzer instead, where the report has to show it to the reader.
 *
 * **Nothing is looked up live.** A valuation produced against the 2026-Q3
 * snapshot must still say 2026-Q3 when it is re-run in 2031, otherwise the
 * report cannot be reproduced and the audit trail is decorative.
 *
 * The multiples below are averages published without confidence intervals, by
 * organisations with a commercial interest in the market they measure. That is
 * not a reason to discard them; it is the reason the analyzer widens them into
 * a range and says so on the page.
 */

export const VALUATION_KNOWLEDGE_SNAPSHOT = "2026-q3";

type MultipleBand = {
  /** Lower bound of adjusted EBITDA this band applies to, in euro. */
  from: number;
  /** Upper bound, exclusive. `Infinity` for the top band. */
  to: number;
  /** Average EBITDA multiple reported for the band. */
  multiple: number;
  label: string;
};

/**
 * Dutch SME EBITDA multiples, Brookz Overname Barometer H1-2025.
 *
 * A survey of Dutch M&A advisors: 126 completed questionnaires from 289
 * advisory firms invited. Advisors are paid a percentage of the sale price,
 * which is a reason to read these as the optimistic end of the truth.
 */
const NL_EBITDA_BANDS: MultipleBand[] = [
  { from: 0, to: 500_000, multiple: 3.5, label: "under €500k of adjusted EBITDA" },
  { from: 500_000, to: 1_000_000, multiple: 3.8, label: "€500k to €1m of adjusted EBITDA" },
  { from: 1_000_000, to: 2_500_000, multiple: 4.1, label: "€1m to €2.5m of adjusted EBITDA" },
  { from: 2_500_000, to: 10_000_000, multiple: 5.2, label: "€2.5m to €10m of adjusted EBITDA" },
  { from: 10_000_000, to: Infinity, multiple: 6.7, label: "€10m or more of adjusted EBITDA" },
];

const SOURCES: Record<string, string> = {
  "nl-ebitda-multiple":
    "Brookz Research, Overname Barometer H1-2025: average EBITDA multiples for Dutch SMEs by normalised EBITDA.",
  "equity-risk-premium":
    "Aswath Damodaran, NYU Stern, implied equity risk premium for mature markets, published monthly.",
};

/**
 * The published width of a multiple band is zero, because none of these
 * publishers reports one. This is our own conservative widening, and the
 * analyzer surfaces it as an assumption rather than presenting it as data.
 */
export const MULTIPLE_BAND_WIDTH = 1.0;

export function multipleBandFor(adjustedEbitda: number): MultipleBand {
  const band = NL_EBITDA_BANDS.find(
    (candidate) => adjustedEbitda >= candidate.from && adjustedEbitda < candidate.to,
  );
  // The bands are exhaustive over the non-negative reals, so this only fires
  // for a negative input, which is a caller error rather than a data gap.
  if (!band) {
    throw new Error(
      `No multiple band covers adjusted EBITDA of ${adjustedEbitda}. Bands start at zero.`,
    );
  }
  return band;
}

function knowledgeEvidence(input: {
  id: string;
  dataset: string;
  key: string;
  statement: string;
  amount: number;
  unit: string;
}): Evidence {
  return createEvidence({
    id: input.id,
    kind: "external",
    statement: input.statement,
    value: { amount: input.amount, unit: input.unit },
    provenance: {
      type: "knowledge",
      dataset: input.dataset,
      snapshot: VALUATION_KNOWLEDGE_SNAPSHOT,
      key: input.key,
    },
  });
}

export const valuationKnowledge: KnowledgeSource = {
  id: "valuation-knowledge",
  version: "1.0.0",
  snapshot: VALUATION_KNOWLEDGE_SNAPSHOT,

  async lookup(dataset: string, key: string): Promise<Evidence | undefined> {
    if (dataset === "nl-ebitda-multiple") {
      const adjustedEbitda = Number(key);
      if (!Number.isFinite(adjustedEbitda) || adjustedEbitda < 0) return undefined;
      const band = multipleBandFor(adjustedEbitda);
      return knowledgeEvidence({
        id: `ev-multiple-${band.from}`,
        dataset,
        key,
        statement: `Dutch businesses at ${band.label} transacted at an average of ${band.multiple}× EBITDA. ${SOURCES[dataset]}`,
        amount: band.multiple,
        unit: "x",
      });
    }

    if (dataset === "equity-risk-premium") {
      return knowledgeEvidence({
        id: "ev-erp",
        dataset,
        key,
        statement: `Implied equity risk premium for mature markets. ${SOURCES[dataset]}`,
        amount: 4.6,
        unit: "%",
      });
    }

    return undefined;
  },
};

export const knowledgeSources = SOURCES;
