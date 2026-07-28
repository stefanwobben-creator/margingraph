import type { AssumptionId } from "./assumption";
import type { EvidenceId } from "./evidence";
import type { ModuleRef } from "./provenance";
import type { Quantity } from "./value";

export type ClaimId = string & { readonly __brand: "ClaimId" };

/**
 * A statement a domain module wants to put in front of a reader.
 *
 * `subject` and `metric` are opaque strings to the kernel — "company" and
 * "enterprise_value" mean nothing here. They exist so the engine can notice
 * that two claims are about the same thing without knowing what that thing is,
 * which is how contradiction detection stays domain-free.
 */
export type Claim = {
  id: ClaimId;
  subject: string;
  metric: string;
  /** The claim in one sentence, without hedging. Confidence is attached separately. */
  statement: string;
  value?: Quantity;
  /** Evidence this claim rests on. A claim with none is ungrounded, and the engine says so. */
  evidence: EvidenceId[];
  assumptions: AssumptionId[];
  /** Other claims this was computed from. */
  derivedFrom: ClaimId[];
  producedBy: ModuleRef;
  /**
   * Conflicts the analyzer knows about and the engine could not infer —
   * two claims that disagree in substance rather than in number.
   */
  conflictsWith?: ClaimId[];
  /** Free tags a template can select on. Never interpreted by the kernel. */
  tags?: string[];
};

/**
 * The only way to create a claim.
 *
 * `evidence`, `assumptions` and `derivedFrom` are required arguments rather
 * than optional fields. A claim that traces to nothing is representable only
 * by explicitly passing three empty arrays, which is a visible decision rather
 * than an oversight.
 */
export function createClaim(input: {
  id: string;
  subject: string;
  metric: string;
  statement: string;
  evidence: string[];
  assumptions: string[];
  derivedFrom: string[];
  producedBy: ModuleRef;
  value?: Quantity;
  conflictsWith?: string[];
  tags?: string[];
}): Claim {
  return {
    ...input,
    id: input.id as ClaimId,
    evidence: input.evidence as EvidenceId[],
    assumptions: input.assumptions as AssumptionId[],
    derivedFrom: input.derivedFrom as ClaimId[],
    conflictsWith: input.conflictsWith as ClaimId[] | undefined,
  };
}
