import {
  ASSUMPTION_LOAD_KEY,
  type AssumptionLoad,
} from "./assumption-load";
import type { Reasoner } from "../reasoner";
import type {
  ConfidenceAssessment,
  ConfidenceBand,
} from "../../types/assessment";

/**
 * Confidence, assembled from what the other reasoners established.
 *
 * Must run last. It reads their output rather than recomputing anything, so
 * there is exactly one definition of evidence quality, of traceability and of
 * assumption load in the system.
 *
 * The score is never presented without its components. A reader who disagrees
 * with the confidence should be able to see which of the four inputs they
 * disagree with.
 */
const WEIGHTS = {
  traceability: 0.3,
  evidenceQuality: 0.3,
  assumptionLoad: 0.25,
  consistency: 0.15,
} as const;

function band(score: number, grounded: boolean): ConfidenceBand {
  if (!grounded) return "insufficient";
  if (score >= 0.75) return "high";
  if (score >= 0.5) return "moderate";
  return "low";
}

export const confidenceReasoner: Reasoner = {
  id: "confidence",
  version: "1.0.0",

  run({ index, soFar }) {
    const grades = new Map(
      soFar.evidenceGrades.map((grade) => [grade.evidenceId, grade.quality]),
    );
    const load = (soFar.extensions[ASSUMPTION_LOAD_KEY] ?? {}) as AssumptionLoad;

    const ungrounded = new Set(
      soFar.traceability
        .filter((issue) => issue.issue === "ungrounded")
        .map((issue) => issue.claimId),
    );

    const conflictSeverity = new Map<string, number>();
    for (const contradiction of soFar.contradictions) {
      for (const id of contradiction.claims) {
        conflictSeverity.set(
          id,
          Math.max(conflictSeverity.get(id) ?? 0, contradiction.severity),
        );
      }
    }

    const confidence: ConfidenceAssessment[] = index.set.claims.map((claim) => {
      const reasons: string[] = [];

      const grounded = !ungrounded.has(claim.id);
      const traceability = grounded ? 1 : 0;
      if (!grounded) reasons.push("Nothing supports this claim.");

      const qualities = claim.evidence
        .map((id) => grades.get(id))
        .filter((value): value is number => value !== undefined);
      const evidenceQuality =
        qualities.length === 0
          ? 0
          : qualities.reduce((a, b) => a + b, 0) / qualities.length;
      if (qualities.length > 0 && evidenceQuality < 0.6) {
        reasons.push("Supporting evidence is asserted rather than measured.");
      }

      const assumptionLoad = load[claim.id] ?? 0;
      if (assumptionLoad > 0.5) {
        reasons.push("More of this rests on assumption than on evidence.");
      }

      const severity = conflictSeverity.get(claim.id) ?? 0;
      const consistency = 1 - severity;
      if (severity > 0) {
        reasons.push("Another claim in this report disagrees with it.");
      }

      const score =
        traceability * WEIGHTS.traceability +
        evidenceQuality * WEIGHTS.evidenceQuality +
        (1 - assumptionLoad) * WEIGHTS.assumptionLoad +
        consistency * WEIGHTS.consistency;

      if (reasons.length === 0) {
        reasons.push("Grounded in measured evidence with few assumptions.");
      }

      return {
        claimId: claim.id,
        band: band(score, grounded),
        score,
        components: {
          traceability,
          evidenceQuality,
          assumptionLoad,
          consistency,
        },
        reasons,
      };
    });

    return { confidence };
  },
};
