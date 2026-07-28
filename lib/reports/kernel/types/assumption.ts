import type { Provenance } from "./provenance";
import type { Quantity } from "./value";

export type AssumptionId = string & { readonly __brand: "AssumptionId" };

/** Who decided this, which determines how defensible it is. */
export type AssumptionOrigin =
  /** The user stated it. */
  | "user"
  /** The template supplies it as a default. */
  | "template"
  /** The analyzer had to pick something. */
  | "analyzer"
  /** Inferred from the data rather than chosen. */
  | "inferred";

/**
 * What happens to a dependent claim if the assumption turns out to be wrong.
 * This is what makes structural counterarguments possible without the kernel
 * understanding the subject matter.
 */
export type AssumptionImpact =
  /** The claim reverses. */
  | "inverts"
  /** The claim survives but with less force. */
  | "weakens"
  /** The claim cannot be evaluated at all. */
  | "unknown";

export type Assumption = {
  id: AssumptionId;
  statement: string;
  origin: AssumptionOrigin;
  impact: AssumptionImpact;
  provenance: Provenance;
  value?: Quantity;
  /** Plausible alternatives, used when reporting sensitivity. */
  alternatives?: Quantity[];
};

export function createAssumption(input: {
  id: string;
  statement: string;
  origin: AssumptionOrigin;
  impact: AssumptionImpact;
  provenance: Provenance;
  value?: Quantity;
  alternatives?: Quantity[];
}): Assumption {
  return { ...input, id: input.id as AssumptionId };
}
