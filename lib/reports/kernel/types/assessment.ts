import type { AssumptionId } from "./assumption";
import type { ClaimId } from "./claim";
import type { EvidenceId } from "./evidence";

/** Confidence is banded for readers and scored for machines. Both are shown. */
export type ConfidenceBand = "high" | "moderate" | "low" | "insufficient";

/**
 * Per-claim confidence, with its components.
 *
 * The components are not diagnostics — they are the product. A score without
 * a breakdown is a number a reader has to trust, which is the opposite of
 * what this platform sells.
 */
export type ConfidenceAssessment = {
  claimId: ClaimId;
  band: ConfidenceBand;
  /** 0–1. Derived from the components below, never set directly. */
  score: number;
  components: {
    /** Is the claim grounded in evidence at all. */
    traceability: number;
    /** How strong and how specifically sourced that evidence is. */
    evidenceQuality: number;
    /** How much of the claim rests on assumption rather than evidence. */
    assumptionLoad: number;
    /** Reduced when the claim conflicts with another. */
    consistency: number;
  };
  /** Plain-language reasons, ordered by how much they moved the score. */
  reasons: string[];
};

export type TraceabilityIssue = {
  claimId: ClaimId;
  issue:
    /** No evidence and no derivation. */
    | "ungrounded"
    /** Cites evidence that is not in the set. */
    | "dangling-evidence"
    /** Cites an assumption that is not in the set. */
    | "dangling-assumption"
    /** Derives from a claim that is not in the set. */
    | "dangling-derivation";
  detail: string;
};

export type Contradiction = {
  claims: [ClaimId, ClaimId];
  kind:
    /** Two claims about the same subject and metric with incompatible values. */
    | "value"
    /** An analyzer declared the conflict. */
    | "declared";
  detail: string;
  /** 0–1. How far apart the values are, for the value kind. */
  severity: number;
};

/**
 * A structural counterargument: not "here is why this is wrong", but "here is
 * the single thing that, if false, changes this answer".
 *
 * Derivable without domain knowledge, because assumptions declare their own
 * impact.
 */
export type Counterargument = {
  assumptionId: AssumptionId;
  statement: string;
  affects: ClaimId[];
  effect: "inverts" | "weakens" | "unknown";
  /** How much of the report rests on this one assumption, 0–1. */
  leverage: number;
};

export type EvidenceGrade = {
  evidenceId: EvidenceId;
  /** 0–1, from evidence kind and how precisely the provenance locates it. */
  quality: number;
  notes: string[];
};

/** Everything the reasoning engine produced, in one value. */
export type Assessment = {
  confidence: ConfidenceAssessment[];
  traceability: TraceabilityIssue[];
  contradictions: Contradiction[];
  counterarguments: Counterargument[];
  evidenceGrades: EvidenceGrade[];
  /** Output of any reasoner registered beyond the built-in set. */
  extensions: Record<string, unknown>;
};

export function emptyAssessment(): Assessment {
  return {
    confidence: [],
    traceability: [],
    contradictions: [],
    counterarguments: [],
    evidenceGrades: [],
    extensions: {},
  };
}
