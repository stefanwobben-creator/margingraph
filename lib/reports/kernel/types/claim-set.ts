import type { Assumption, AssumptionId } from "./assumption";
import type { Claim, ClaimId } from "./claim";
import type { Evidence, EvidenceId } from "./evidence";

/**
 * The standardised hand-off between domain analysis and the reasoning engine.
 *
 * This is the only thing the engine ever receives. It never sees a document, a
 * spreadsheet or a domain object — which is what keeps it domain-free by
 * construction rather than by discipline.
 */
export type ClaimSet = {
  claims: readonly Claim[];
  evidence: readonly Evidence[];
  assumptions: readonly Assumption[];
};

/** Indexed view, built once so reasoners do not each re-scan the arrays. */
export type ClaimIndex = {
  set: ClaimSet;
  claim(id: ClaimId): Claim | undefined;
  evidenceItem(id: EvidenceId): Evidence | undefined;
  assumption(id: AssumptionId): Assumption | undefined;
  /** Claims sharing a subject and metric — the basis for contradiction detection. */
  bySubjectMetric(): Map<string, Claim[]>;
  /** Claims that depend on a given assumption, directly or through derivation. */
  dependents(id: AssumptionId): Claim[];
};

export function indexClaims(set: ClaimSet): ClaimIndex {
  const claims = new Map(set.claims.map((c) => [c.id, c]));
  const evidence = new Map(set.evidence.map((e) => [e.id, e]));
  const assumptions = new Map(set.assumptions.map((a) => [a.id, a]));

  let grouped: Map<string, Claim[]> | null = null;
  const dependentCache = new Map<AssumptionId, Claim[]>();

  /** Walks derivation edges so an assumption two steps back still counts. */
  function assumptionsOf(claim: Claim, seen = new Set<ClaimId>()): Set<AssumptionId> {
    if (seen.has(claim.id)) return new Set();
    seen.add(claim.id);
    const result = new Set<AssumptionId>(claim.assumptions);
    for (const parentId of claim.derivedFrom) {
      const parent = claims.get(parentId);
      if (!parent) continue;
      for (const id of assumptionsOf(parent, seen)) result.add(id);
    }
    return result;
  }

  return {
    set,
    claim: (id) => claims.get(id),
    evidenceItem: (id) => evidence.get(id),
    assumption: (id) => assumptions.get(id),
    bySubjectMetric() {
      if (grouped) return grouped;
      grouped = new Map();
      for (const claim of set.claims) {
        const key = `${claim.subject}::${claim.metric}`;
        const bucket = grouped.get(key);
        if (bucket) bucket.push(claim);
        else grouped.set(key, [claim]);
      }
      return grouped;
    },
    dependents(id) {
      const cached = dependentCache.get(id);
      if (cached) return cached;
      const result = set.claims.filter((claim) => assumptionsOf(claim).has(id));
      dependentCache.set(id, result);
      return result;
    },
  };
}
