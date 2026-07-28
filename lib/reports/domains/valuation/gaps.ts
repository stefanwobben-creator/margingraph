import { marketMultiple, type Range } from "./methods";
import { MULTIPLE_BAND_WIDTH, multipleBandFor } from "@/lib/reports/knowledge/valuation-2026-q3";

/**
 * What a report says when it cannot say what the business is worth.
 *
 * Four of the first seven real files we ran could not be valued: one had
 * turnover and no profit and loss, two lost money once the owner was paid,
 * one had management already employed and tripped a rule written for
 * owner-managed businesses. In every case the useful answer was not a number
 * but the one figure that would produce one.
 *
 * So a gap is not an error. It is the finding, and it ships with the
 * arithmetic that shows what the missing figure is worth.
 */

/** Margins to show when earnings are unknown but turnover is not. */
export const MARGIN_LADDER = [0.05, 0.1, 0.15, 0.2] as const;

export type MarginScenario = {
  margin: number;
  impliedEbitda: number;
  enterprise: Range;
};

/**
 * The value of the business at each of several profit margins.
 *
 * Deliberately not a forecast and deliberately not a guess at which rung
 * applies. It exists so a reader can see that the figure they have not sent
 * us is worth, in their case, the difference between a quarter of a million
 * and two million. That is usually enough to make them go and find it.
 */
export function marginLadder(input: {
  revenue: number;
  margins?: readonly number[];
}): MarginScenario[] {
  if (!(input.revenue > 0)) return [];

  return (input.margins ?? MARGIN_LADDER).map((margin) => {
    const impliedEbitda = input.revenue * margin;
    const band = multipleBandFor(impliedEbitda);
    return {
      margin,
      impliedEbitda,
      enterprise: marketMultiple({
        adjustedEbitda: impliedEbitda,
        multiple: band.multiple,
        bandWidth: MULTIPLE_BAND_WIDTH,
      }),
    };
  });
}

/** Rounded to the nearest thousand: false precision on a hypothetical is worse than none. */
export function describeLadder(scenarios: MarginScenario[]): string {
  const k = (amount: number) => `€${Math.round(amount / 1000).toLocaleString("en-GB")}k`;
  return scenarios
    .map((s) => `${(s.margin * 100).toFixed(0)}% → ${k(s.enterprise.low)} to ${k(s.enterprise.high)}`)
    .join("; ");
}
