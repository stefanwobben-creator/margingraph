import type { FindingsInput, Period } from "@/lib/reports/findings/types";
import { has } from "@/lib/reports/intake/vocabulary";

const euro = (n: number) => `€${Math.round(Math.abs(n)).toLocaleString("en-GB")}`;
const pct = (n: number) => `${(Math.abs(n) * 100).toFixed(1)}%`;

/**
 * Words that mean the comparison column is a plan, not a year that happened.
 *
 * Direction is the whole product here. Beating a budget says the budget was
 * beatable; it says nothing about whether the business got stronger. Run
 * these signals against a plan and every one of them scores the optimism of
 * whoever wrote the plan.
 */
const PLAN = ["budget", "begroot", "begroting", "plan", "forecast", "prognose"] as const;

export type Signal = {
  id: "turnover" | "margin" | "ler" | "result" | "overheads";
  /** What is being measured, in the owner's words. */
  name: string;
  stronger: boolean;
  /** The two figures, so the verdict can be checked in ten seconds. */
  detail: string;
};

export type SignalsReport = {
  signals: Signal[];
  /** How many point the right way. */
  score: number;
  text: string;
};

/**
 * Why the signals cannot run on this file, in the sender's words.
 *
 * Exported because the catalogue gate and the report must never disagree
 * about whether the report is possible, and the way to guarantee that is one
 * function both of them call.
 */
export function whySignalsBlocked(input: FindingsInput | undefined): string | undefined {
  if (!input) return "no readable figures";
  if (!input.reference) return "one year on its own has no direction; send last year beside it";
  if (has(input.reference.label, PLAN)) {
    return "your file compares against a budget, and beating a plan is not the same as getting stronger; send last year's figures";
  }
  if (compute(input).length < 3) {
    return "too few lines carry both years, so a verdict would rest on one or two numbers";
  }
  return undefined;
}

/**
 * Is the business getting stronger or weaker?
 *
 * Piotroski asks nine questions of two years of accounts. Four of them live
 * in the balance sheet, and this report does not pretend otherwise: it runs
 * the ones a profit and loss account can carry, says the score out of the
 * signals it could actually test, and names what the balance sheet would add.
 * A nine-signal score computed from five signals is the kind of quiet
 * rounding-up this product exists to replace.
 */
export function signalsReport(input: FindingsInput): SignalsReport | undefined {
  if (whySignalsBlocked(input)) return undefined;

  const signals = compute(input);
  const score = signals.filter((s) => s.stronger).length;

  const verdict =
    score === signals.length
      ? "Every signal this file carries points the right way."
      : score === 0
        ? "Every signal this file carries points the wrong way. That is rare, and it is not a nuance."
        : score >= Math.ceil(signals.length / 2)
          ? "More signals point up than down, and the ones pointing down are named below."
          : "More signals point down than up. The direction matters more than any single number below.";

  const lines = [
    `${score} of ${signals.length} signals say stronger, comparing ${input.actual.label} against ${input.reference!.label}.`,
    ``,
    ...signals.map(
      (s) => `  ${s.stronger ? "▲" : "▼"} ${s.name.padEnd(34)} ${s.detail}`,
    ),
    ``,
    verdict,
    ``,
    `What this is: the profit-and-loss half of a nine-signal health check (Piotroski's, if ` +
      `you want to look it up). The other four signals live in the balance sheet — debt, ` +
      `liquidity, cash flow against profit — and we do not score what we cannot see. Send ` +
      `the balance sheets for both years and the score runs out of nine.`,
  ];

  return { signals, score, text: lines.join("\n") + "\n" };
}

// --- the individual signals ----------------------------------------------

const value = (period: Period, key: string) => {
  const raw = period.values[key];
  return raw === undefined ? undefined : Math.abs(raw);
};

/** Gross profit rebuilt as turnover minus the cost-of-sales lines. */
function grossOf(input: FindingsInput, period: Period): number | undefined {
  const tier1 = (input.tiers ?? []).filter((t) => t.tier === 1);
  if (tier1.length === 0) return undefined;
  const revenue = value(period, period.revenueKey);
  if (!revenue) return undefined;
  let bought = 0;
  for (const line of tier1) {
    const v = value(period, line.key);
    if (v === undefined) return undefined;
    bought += v;
  }
  return revenue - bought;
}

function labourOf(input: FindingsInput, period: Period): number | undefined {
  const lines = input.labourLines ?? [];
  if (lines.length === 0) return undefined;
  let total = 0;
  for (const line of lines) {
    const v = value(period, line.key);
    if (v === undefined) return undefined;
    total += v;
  }
  return total;
}

/** Operating result: gross profit minus everything below it, per period. */
function resultOf(input: FindingsInput, period: Period): number | undefined {
  const gross = grossOf(input, period);
  if (gross === undefined) return undefined;
  const tier1 = new Set((input.tiers ?? []).filter((t) => t.tier === 1).map((t) => t.key));
  let below = 0;
  for (const line of input.costLines ?? []) {
    if (tier1.has(line.key)) continue;
    const v = value(period, line.key);
    if (v === undefined) return undefined;
    below += v;
  }
  const credits = (input.recoveries ?? []).reduce(
    (total, pair) => total + (value(period, pair.recovery) ?? 0),
    0,
  );
  return gross - below + credits;
}

function overheadsOf(input: FindingsInput, period: Period): number | undefined {
  const tier4 = (input.tiers ?? []).filter((t) => t.tier === 4);
  if (tier4.length === 0) return undefined;
  let total = 0;
  for (const line of tier4) {
    const v = value(period, line.key);
    if (v === undefined) return undefined;
    total += v;
  }
  return total;
}

function compute(input: FindingsInput): Signal[] {
  const { actual, reference } = input;
  if (!reference) return [];
  const signals: Signal[] = [];

  const revNow = value(actual, actual.revenueKey);
  const revThen = value(reference, reference.revenueKey);
  if (revNow && revThen) {
    signals.push({
      id: "turnover",
      name: "Turnover",
      stronger: revNow > revThen,
      detail: `${euro(revNow)} against ${euro(revThen)}`,
    });
  }

  const grossNow = grossOf(input, actual);
  const grossThen = grossOf(input, reference);
  if (grossNow !== undefined && grossThen !== undefined && revNow && revThen) {
    const mNow = grossNow / revNow;
    const mThen = grossThen / revThen;
    signals.push({
      id: "margin",
      name: "Kept of every euro, after buying",
      stronger: mNow > mThen,
      detail: `${Math.round(mNow * 100)} cents against ${Math.round(mThen * 100)}`,
    });
  }

  const labourNow = labourOf(input, actual);
  const labourThen = labourOf(input, reference);
  if (
    grossNow !== undefined &&
    grossThen !== undefined &&
    labourNow &&
    labourThen
  ) {
    const lerNow = grossNow / labourNow;
    const lerThen = grossThen / labourThen;
    signals.push({
      id: "ler",
      name: "Gross profit per euro of labour",
      stronger: lerNow > lerThen,
      detail: `€${lerNow.toFixed(2)} against €${lerThen.toFixed(2)}`,
    });
  }

  const resultNow = resultOf(input, actual);
  const resultThen = resultOf(input, reference);
  if (resultNow !== undefined && resultThen !== undefined) {
    signals.push({
      id: "result",
      name: "Operating result",
      stronger: resultNow > resultThen,
      detail: `${resultNow < 0 ? "−" : ""}${euro(resultNow)} against ${resultThen < 0 ? "−" : ""}${euro(resultThen)}`,
    });
  }

  // The discipline signal: did the cost of existing grow slower than the
  // money that has to pay for it? Overheads outpacing gross profit is how a
  // good year quietly becomes a bad company.
  const overheadNow = overheadsOf(input, actual);
  const overheadThen = overheadsOf(input, reference);
  if (
    overheadNow !== undefined &&
    overheadThen !== undefined &&
    overheadThen > 0 &&
    grossNow !== undefined &&
    grossThen !== undefined &&
    grossThen > 0
  ) {
    const overheadGrowth = overheadNow / overheadThen - 1;
    const grossGrowth = grossNow / grossThen - 1;
    signals.push({
      id: "overheads",
      name: "Overheads against gross profit",
      stronger: overheadGrowth < grossGrowth,
      detail: `overheads ${overheadGrowth < 0 ? "down" : "up"} ${pct(overheadGrowth)}, gross profit ${grossGrowth < 0 ? "down" : "up"} ${pct(grossGrowth)}`,
    });
  }

  return signals;
}
