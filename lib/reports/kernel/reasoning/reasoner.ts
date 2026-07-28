import type { Assessment } from "../types/assessment";
import type { ClaimIndex } from "../types/claim-set";

/**
 * What a reasoner sees: the indexed claim set, and whatever earlier reasoners
 * have already established.
 *
 * Reasoners run in registration order and may read the accumulating assessment.
 * That is a deliberate simplification over a dependency graph — with six
 * built-in reasoners, an ordering convention is cheaper than a scheduler and
 * has not cost anything yet. Revisit if a reasoner ever needs to run twice.
 */
export type ReasoningContext = {
  index: ClaimIndex;
  soFar: Readonly<Assessment>;
};

/** A reasoner contributes part of the assessment. It never mutates the input. */
export type Reasoner = {
  id: string;
  version: string;
  run(context: ReasoningContext): Partial<Assessment>;
};

/** Merges a reasoner's output into the accumulating assessment. */
export function mergeAssessment(
  base: Assessment,
  patch: Partial<Assessment>,
): Assessment {
  return {
    confidence: patch.confidence ?? base.confidence,
    traceability: patch.traceability ?? base.traceability,
    contradictions: patch.contradictions ?? base.contradictions,
    counterarguments: patch.counterarguments ?? base.counterarguments,
    evidenceGrades: patch.evidenceGrades ?? base.evidenceGrades,
    extensions: { ...base.extensions, ...patch.extensions },
  };
}
