import type { Reasoner } from "../reasoner";

/**
 * How much of each claim rests on assumption rather than evidence.
 *
 * Stored under `extensions` rather than as a first-class assessment field:
 * it is an input to confidence, not something a report shows on its own. If
 * that changes, promoting it is a type change and nothing else.
 */
export const ASSUMPTION_LOAD_KEY = "assumption-load";

/** Per-claim ratio, 0 (pure evidence) to 1 (pure assumption). */
export type AssumptionLoad = Record<string, number>;

/** Weights by who chose the assumption. A user's own input is not a guess. */
const ORIGIN_WEIGHT = {
  user: 0.4,
  inferred: 0.6,
  template: 0.9,
  analyzer: 1,
} as const;

export const assumptionLoadReasoner: Reasoner = {
  id: "assumption-load",
  version: "1.0.0",

  run({ index }) {
    const load: AssumptionLoad = {};

    for (const claim of index.set.claims) {
      const weighted = claim.assumptions.reduce((total, id) => {
        const assumption = index.assumption(id);
        return total + (assumption ? ORIGIN_WEIGHT[assumption.origin] : 1);
      }, 0);

      const support = claim.evidence.length + claim.derivedFrom.length;
      load[claim.id] = weighted === 0 ? 0 : weighted / (weighted + support);
    }

    return { extensions: { [ASSUMPTION_LOAD_KEY]: load } };
  },
};
