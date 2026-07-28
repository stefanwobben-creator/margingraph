import type { Reasoner } from "../reasoner";
import type { Contradiction } from "../../types/assessment";
import { comparable, rangesOverlap, relativeGap } from "../../types/value";

/**
 * Two claims about the same subject and metric that cannot both hold.
 *
 * The kernel does not know what "enterprise_value" means. It knows that two
 * claims carrying that same metric, in the same unit, with non-overlapping
 * ranges, disagree — and that is enough to surface it.
 *
 * Values within this fraction of each other are treated as agreement rather
 * than contradiction; rounding and method differences are not conflicts.
 */
const AGREEMENT_TOLERANCE = 0.05;

export const consistencyReasoner: Reasoner = {
  id: "consistency",
  version: "1.0.0",

  run({ index }) {
    const contradictions: Contradiction[] = [];
    const seen = new Set<string>();

    const record = (contradiction: Contradiction) => {
      const key = [...contradiction.claims].sort().join("|");
      if (seen.has(key)) return;
      seen.add(key);
      contradictions.push(contradiction);
    };

    // Conflicts an analyzer knew about and the kernel could not infer.
    for (const claim of index.set.claims) {
      for (const otherId of claim.conflictsWith ?? []) {
        const other = index.claim(otherId);
        if (!other) continue;
        record({
          claims: [claim.id, other.id],
          kind: "declared",
          detail: `"${claim.statement}" and "${other.statement}" were declared to conflict.`,
          severity: 1,
        });
      }
    }

    // Numeric disagreement about the same thing.
    for (const group of index.bySubjectMetric().values()) {
      if (group.length < 2) continue;

      for (let i = 0; i < group.length; i += 1) {
        for (let j = i + 1; j < group.length; j += 1) {
          const a = group[i];
          const b = group[j];
          if (!a.value || !b.value) continue;
          if (!comparable(a.value, b.value)) continue;
          if (rangesOverlap(a.value, b.value)) continue;

          const gap = relativeGap(a.value, b.value);
          if (gap <= AGREEMENT_TOLERANCE) continue;

          record({
            claims: [a.id, b.id],
            kind: "value",
            detail:
              `Two claims about ${a.subject}/${a.metric} do not overlap: ` +
              `${a.value.amount} ${a.value.unit} versus ${b.value.amount} ${b.value.unit}.`,
            severity: Math.min(1, gap),
          });
        }
      }
    }

    return { contradictions };
  },
};
