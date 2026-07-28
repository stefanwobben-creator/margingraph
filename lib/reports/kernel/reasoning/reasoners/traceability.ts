import type { Reasoner } from "../reasoner";
import type { TraceabilityIssue } from "../../types/assessment";

/**
 * Can every claim be followed back to something?
 *
 * This runs first because everything downstream is meaningless without it: a
 * confidence score on an ungrounded claim is a number about nothing.
 */
export const traceabilityReasoner: Reasoner = {
  id: "traceability",
  version: "1.0.0",

  run({ index }) {
    const issues: TraceabilityIssue[] = [];

    for (const claim of index.set.claims) {
      if (
        claim.evidence.length === 0 &&
        claim.derivedFrom.length === 0
      ) {
        issues.push({
          claimId: claim.id,
          issue: "ungrounded",
          detail: `"${claim.statement}" cites no evidence and derives from no other claim.`,
        });
      }

      for (const id of claim.evidence) {
        if (!index.evidenceItem(id)) {
          issues.push({
            claimId: claim.id,
            issue: "dangling-evidence",
            detail: `Evidence ${id} is cited but not present in the claim set.`,
          });
        }
      }

      for (const id of claim.assumptions) {
        if (!index.assumption(id)) {
          issues.push({
            claimId: claim.id,
            issue: "dangling-assumption",
            detail: `Assumption ${id} is cited but not present in the claim set.`,
          });
        }
      }

      for (const id of claim.derivedFrom) {
        if (!index.claim(id)) {
          issues.push({
            claimId: claim.id,
            issue: "dangling-derivation",
            detail: `Derived from claim ${id}, which is not present in the claim set.`,
          });
        }
      }
    }

    return { traceability: issues };
  },
};
