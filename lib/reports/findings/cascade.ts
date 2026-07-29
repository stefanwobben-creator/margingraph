import { TIERS, type Tier } from "@/lib/reports/intake/vocabulary";

import type { FindingsInput, Period } from "./types";

export type CascadeStep = {
  tier: Tier;
  /** "Net sales to gross profit", and so on. */
  step: string;
  label: string;
  /** Euros of cost taken out at this step. */
  cost: number;
  /** That cost as a share of net sales. */
  share: number;
  /** What is left after this step, as a share of net sales. */
  remaining: number;
};

export type Cascade = { steps: CascadeStep[]; revenue: number };

/**
 * Net sales down to EBITDA, one step at a time.
 *
 * An accounting package sorts costs by ledger code, which is the order the
 * bookkeeper needs and the wrong order for deciding anything. This sorts them
 * by distance from the sale: what it cost to buy, to fulfil, to win, and to
 * keep the lights on. Each step has a different owner and a different
 * conversation, so naming the step that widened is most of the answer.
 */
export function cascade(period: Period, tiers: NonNullable<FindingsInput["tiers"]>): Cascade {
  const revenue = period.values[period.revenueKey];
  if (!revenue) return { steps: [], revenue: 0 };

  let remaining = 1;
  const steps: CascadeStep[] = [];

  for (const tier of TIERS) {
    const cost = tiers
      .filter((line) => line.tier === tier.tier)
      .reduce((sum, line) => sum + Math.abs(period.values[line.key] ?? 0), 0);
    if (cost === 0) continue;
    const share = cost / revenue;
    remaining -= share;
    steps.push({
      tier: tier.tier,
      step: tier.step,
      label: tier.label,
      cost,
      share,
      remaining,
    });
  }

  return { steps, revenue };
}
