import { assumptionLoadReasoner } from "./reasoners/assumption-load";
import { confidenceReasoner } from "./reasoners/confidence";
import { consistencyReasoner } from "./reasoners/consistency";
import { counterargumentReasoner } from "./reasoners/counterarguments";
import { evidenceQualityReasoner } from "./reasoners/evidence-quality";
import { traceabilityReasoner } from "./reasoners/traceability";
import {
  mergeAssessment,
  type Reasoner,
} from "./reasoner";
import { createRegistry } from "../registry/registry";
import {
  emptyAssessment,
  type Assessment,
} from "../types/assessment";
import { indexClaims, type ClaimSet } from "../types/claim-set";

export const reasonerRegistry = createRegistry<Reasoner>("reasoner");

/**
 * The built-in set, in execution order.
 *
 * Order is not incidental: traceability establishes what is grounded, the two
 * quality reasoners establish how well, consistency finds disagreement, and
 * confidence combines all four. Confidence must remain last — it reads the
 * others rather than recomputing anything, which is what keeps a single
 * definition of each concept in the system.
 */
const BUILT_IN: Reasoner[] = [
  traceabilityReasoner,
  evidenceQualityReasoner,
  assumptionLoadReasoner,
  consistencyReasoner,
  counterargumentReasoner,
  confidenceReasoner,
];

for (const reasoner of BUILT_IN) reasonerRegistry.register(reasoner);

/**
 * The reasoning engine.
 *
 * Receives a ClaimSet and nothing else. It has no access to documents, no
 * knowledge of finance, and no way to acquire either — which is what makes
 * "domain-independent" a property of the type signature rather than a promise
 * in a document.
 */
export function reason(set: ClaimSet): Assessment {
  const index = indexClaims(set);
  let assessment = emptyAssessment();

  for (const reasoner of reasonerRegistry.all()) {
    const patch = reasoner.run({ index, soFar: assessment });
    assessment = mergeAssessment(assessment, patch);
  }

  return assessment;
}
