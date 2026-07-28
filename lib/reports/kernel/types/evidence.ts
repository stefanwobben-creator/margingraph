import type { ModuleRef, Provenance } from "./provenance";
import type { Quantity } from "./value";

export type EvidenceId = string & { readonly __brand: "EvidenceId" };

/**
 * How an evidence item came to be known.
 *
 * The kernel grades these; a domain module states which kind applies but
 * cannot assert how strong its own evidence is. That judgement stays with the
 * epistemic layer, or every analyzer would grade itself generously.
 */
export type EvidenceKind =
  /** Read directly from a source document. */
  | "measured"
  /** Asserted by a party with an interest in the answer. */
  | "stated"
  /** Computed from other evidence. */
  | "derived"
  /** From an independent, versioned dataset. */
  | "external";

export type Evidence = {
  id: EvidenceId;
  kind: EvidenceKind;
  /** What this evidence says, in one line. */
  statement: string;
  value?: Quantity;
  provenance: Provenance;
  /** Set when the evidence is known to be out of date. */
  asOf?: string;
};

/**
 * The only way to create evidence.
 *
 * Provenance is a required argument rather than an optional field, so evidence
 * without a source cannot be represented.
 */
export function createEvidence(input: {
  id: string;
  kind: EvidenceKind;
  statement: string;
  provenance: Provenance;
  value?: Quantity;
  asOf?: string;
}): Evidence {
  return { ...input, id: input.id as EvidenceId };
}

/** Convenience for evidence that a module computed from other evidence. */
export function deriveEvidence(input: {
  id: string;
  statement: string;
  from: string[];
  by: ModuleRef;
  value?: Quantity;
}): Evidence {
  return createEvidence({
    id: input.id,
    kind: "derived",
    statement: input.statement,
    value: input.value,
    provenance: { type: "derived", from: input.from, by: input.by },
  });
}
