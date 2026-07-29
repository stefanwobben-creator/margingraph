import { ratioDrift } from "@/lib/reports/findings/rules";
import type { FindingsInput } from "@/lib/reports/findings/types";

const euro = (n: number) => `€${Math.round(Math.abs(n)).toLocaleString("en-GB")}`;
const signedEuro = (n: number) => `${n < 0 ? "−" : ""}${euro(n)}`;
const pct = (n: number) => `${(Math.abs(n) * 100).toFixed(1)}%`;

/**
 * The two what-if reports share one model of the company.
 *
 * Everything hangs on splitting the operating costs into two piles: the ones
 * that follow volume (buying is already inside the gross margin; fulfilling
 * and winning the order are tiers 2 and 3) and the ones that do not (tier 4,
 * the cost of existing). Get that split wrong and both reports are confident
 * nonsense, which is why neither runs unless the file gave us a gross margin
 * line and the reader managed to place the costs.
 */
type Model = {
  revenue: number;
  /** Gross profit, from the file's own margin line. Scales with volume. */
  gross: number;
  /** Tier 2 and 3 costs, net of what is billed back to customers. Scale. */
  flex: number;
  /** Tier 4. Does not move when a quiet month arrives. */
  fixed: number;
  /** What is left after all of the above, at today's volume. */
  leftover: number;
  /** Flex lines that did not actually follow volume last period. */
  sticky: string[];
};

export function buildModel(input: FindingsInput): Model | undefined {
  const { actual, contributionMargin, tiers = [], recoveries = [] } = input;
  const revenue = actual.values[actual.revenueKey];
  if (!revenue || !contributionMargin || tiers.length === 0) return undefined;

  const gross = contributionMargin * revenue;

  const flexGrossKeys = new Set(
    tiers.filter((t) => t.tier === 2 || t.tier === 3).map((t) => t.key),
  );
  const flexCost = tiers
    .filter((t) => flexGrossKeys.has(t.key))
    .reduce((sum, t) => sum + Math.abs(actual.values[t.key] ?? 0), 0);
  // Freight billed back to customers is volume income hiding on the cost side.
  const credits = recoveries.reduce(
    (sum, pair) => sum + Math.abs(actual.values[pair.recovery] ?? 0),
    0,
  );
  const flex = flexCost - credits;

  const fixed = tiers
    .filter((t) => t.tier === 4)
    .reduce((sum, t) => sum + Math.abs(actual.values[t.key] ?? 0), 0);

  // Contracts that were supposed to flex and did not, last period. They make
  // the cushion smaller than the arithmetic below assumes, and saying so is
  // the difference between a model and a promise.
  const sticky = ratioDrift(input)
    .flatMap((f) => f.source)
    .filter((key) => flexGrossKeys.has(key))
    .map((key) => tiers.find((t) => t.key === key)?.label ?? key);

  return {
    revenue,
    gross,
    flex,
    fixed,
    leftover: gross - flex - fixed,
    sticky: [...new Set(sticky)],
  };
}

export type ShockReport = {
  /** Leftover today, after the shock, and the drop the company can absorb. */
  now: number;
  after: number;
  absorb: number;
  text: string;
};

/**
 * What a 20% drop in turnover would actually do.
 *
 * The number owners guess is "profit drops 20%". It never does, because the
 * fixed pile does not shrink with the quiet month. The honest outputs are the
 * leftover after the shock and the drop the company can absorb before the
 * leftover reaches zero — the cushion, which is the number worth knowing
 * before the quiet month rather than during it.
 */
export function shockReport(input: FindingsInput, drop = 0.2): ShockReport | undefined {
  const model = buildModel(input);
  if (!model) return undefined;

  const { revenue, gross, flex, fixed, leftover, sticky } = model;
  const keep = 1 - drop;
  const contribution = gross - flex;
  const after = keep * contribution - fixed;
  // The drop at which the leftover reaches zero. Negative when it is already
  // below zero, and the text says that plainly instead of quoting a cushion.
  const absorb = contribution > 0 ? 1 - fixed / contribution : 0;

  const lines = [
    `If your turnover fell ${pct(drop)}, from ${euro(revenue)} to ${euro(revenue * keep)}:`,
    ``,
    `  What is left today            ${signedEuro(leftover)}`,
    `  What would be left            ${signedEuro(after)}`,
    ``,
  ];

  if (leftover > 0 && after < 0) {
    lines.push(
      `A ${pct(drop)} drop in turnover does not take ${pct(drop)} of your result. It takes all ` +
        `of it and then some, because ${euro(fixed)} of running costs does not shrink with a ` +
        `quiet month.`,
    );
  } else if (leftover > 0) {
    lines.push(
      `That is a ${pct(1 - after / leftover)} fall in your result from a ${pct(drop)} fall in ` +
        `turnover. The gap between those two numbers is your fixed cost base at work.`,
    );
  } else {
    lines.push(
      `The result is already below zero at today's volume, so the question is not what a drop ` +
        `would do. It is which of the numbers above has to move first.`,
    );
  }

  lines.push(``);
  if (absorb > 0) {
    lines.push(
      `The cushion: turnover can fall ${pct(absorb)} before nothing is left. Every euro of ` +
        `fixed cost you remove moves that line further away.`,
    );
  }

  if (sticky.length > 0) {
    lines.push(
      ``,
      `Note: last period ${sticky.join(", ")} did not follow your volume down, although the ` +
        `contract type says it should. If that happens again, the picture above is too kind.`,
    );
  }

  lines.push(
    ``,
    `Check: gross profit ${euro(gross)}, minus ${euro(flex)} of costs that move with volume, ` +
      `minus ${euro(fixed)} that do not, leaves ${signedEuro(leftover)}. At ${pct(keep)} of ` +
      `volume the first two scale and the third does not.`,
  );

  return { now: leftover, after, absorb, text: lines.join("\n") + "\n" };
}

export type PricingStep = {
  rise: number;
  /** Volume that can walk away before the rise stops paying for itself. */
  breakEvenLoss: number;
  /** What the rise earns per period if nobody walks. */
  worth: number;
};

export type PricingReport = {
  steps: PricingStep[];
  cut: { drop: number; neededGain: number };
  text: string;
};

/**
 * How much volume a price rise can cost before it stops paying.
 *
 * One formula does all the work: with a contribution margin m, a price rise p
 * breaks even when volume falls by p / (p + m). Owners consistently guess this
 * number far too low, which is why they do not raise prices; the same formula
 * run backwards shows why discounting is so expensive, and that half is the
 * one nobody asks for and everybody needs.
 */
export function pricingReport(input: FindingsInput): PricingReport | undefined {
  const { actual, contributionMargin: m } = input;
  const revenue = actual.values[actual.revenueKey];
  if (!revenue || !m || m <= 0 || m >= 1) return undefined;

  const steps: PricingStep[] = [0.02, 0.05, 0.1].map((rise) => ({
    rise,
    breakEvenLoss: rise / (rise + m),
    worth: rise * revenue,
  }));

  const drop = 0.05;
  const cut = { drop, neededGain: drop / (m - drop) };

  const width = Math.max(...steps.map((s) => `Raise prices ${pct(s.rise)}`.length));
  const table = steps
    .map((s) => {
      const label = `Raise prices ${pct(s.rise)}`.padEnd(width);
      return `  ${label}   worth ${euro(s.worth).padStart(9)}   safe while you lose under ${pct(s.breakEvenLoss)} of volume`;
    })
    .join("\n");

  const text =
    `You keep ${Math.round(m * 100)} cents of every extra euro of turnover. That one number ` +
    `decides what a price change does to you.\n\n${table}\n\n` +
    `Those break-even points are almost always higher than the owner's guess, which is why ` +
    `prices stay where somebody set them years ago. The amounts assume volume holds; the ` +
    `percentages say how much may walk away before you are worse off.\n\n` +
    `The same arithmetic backwards, because it is the half nobody asks: a ${pct(cut.drop)} ` +
    `discount needs ${pct(cut.neededGain)} more volume just to stand still. A discount is a ` +
    `bet that customers will buy ${pct(cut.neededGain)} more. Most will not.\n\n` +
    `Check: at a margin of ${pct(m)}, a rise of p breaks even at p ÷ (p + ${m.toFixed(3)}) of ` +
    `volume lost, and a cut of p needs p ÷ (${m.toFixed(3)} − p) of volume gained.\n`;

  return { steps, cut, text };
}
