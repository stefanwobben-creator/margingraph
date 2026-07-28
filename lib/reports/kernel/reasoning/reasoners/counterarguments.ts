import type { Reasoner } from "../reasoner";
import type { Counterargument } from "../../types/assessment";

/**
 * The single thing that, if wrong, changes the answer.
 *
 * This is not an attempt to argue against a conclusion — the kernel has no
 * idea what the conclusion means. It is structural: an assumption declares
 * what happens to a claim if it turns out to be false, and the kernel counts
 * how much of the report rests on it.
 *
 * Leverage is the share of claims affected. An assumption carrying 60% of a
 * report is the assumption the negotiation will be about, and a reader should
 * see that before they see the number.
 */
export const counterargumentReasoner: Reasoner = {
  id: "counterarguments",
  version: "1.0.0",

  run({ index }) {
    const total = index.set.claims.length;
    if (total === 0) return { counterarguments: [] };

    const counterarguments: Counterargument[] = index.set.assumptions
      .map((assumption) => {
        const affected = index.dependents(assumption.id);
        return {
          assumptionId: assumption.id,
          statement: assumption.statement,
          affects: affected.map((claim) => claim.id),
          effect: assumption.impact,
          leverage: affected.length / total,
        } satisfies Counterargument;
      })
      .filter((item) => item.affects.length > 0)
      .sort((a, b) => {
        // An assumption that inverts a claim outranks one that merely weakens
        // it, whatever their leverage.
        const rank = { inverts: 0, unknown: 1, weakens: 2 } as const;
        const byEffect = rank[a.effect] - rank[b.effect];
        return byEffect !== 0 ? byEffect : b.leverage - a.leverage;
      });

    return { counterarguments };
  },
};
