import type { FindingsInput } from "@/lib/reports/findings/types";
import { has } from "@/lib/reports/intake/vocabulary";

const euro = (n: number) => `€${Math.round(Math.abs(n)).toLocaleString("en-GB")}`;
const signedEuro = (n: number) => `${n < 0 ? "−" : ""}${euro(n)}`;

/**
 * Costs in the file that never left the bank account.
 *
 * Depreciation is the one line every set of annual accounts carries that is
 * not money going out this year: it is money that went out years ago, being
 * remembered on a schedule. A runway computed with it included tells an owner
 * they die three months earlier than the bank statement says, and an owner
 * who catches that once never trusts the rest of the page again.
 */
const NON_CASH = ["afschrijving", "depreciation", "amortisation", "amortization"] as const;

export type RunwayOptions = {
  /** What is in the bank today, in euros. The one number a P&L cannot know. */
  cash: number;
  /**
   * How many months the profit and loss account covers. Twelve for a set of
   * annual accounts, three for a quarter. There is no safe way to read this
   * off the figures themselves, so it is an input, and the report says out
   * loud which value it used.
   */
  months?: number;
};

export type RunwayReport = {
  /** Euros leaving the bank per month at the period's pace. Negative = adding. */
  monthlyBurn: number;
  /** Months until the cash reaches zero at that pace. Undefined when it never does. */
  monthsLeft?: number;
  text: string;
};

/**
 * How long the money lasts.
 *
 * The arithmetic is one division: cash today over cash leaving per month. All
 * of the work is in being honest about the numerator and the denominator. The
 * denominator comes from the profit and loss account, so it is last period's
 * pace, not a promise about next period; it excludes depreciation because
 * depreciation is not cash; and it knows nothing about the balance sheet
 * timing that decides whether a given Tuesday is survivable — VAT quarters,
 * customer prepayments, a supplier who shortens terms. The text says all of
 * that, because a runway number quoted without its assumptions is not
 * information, it is reassurance.
 */
export function runwayReport(input: FindingsInput, options: RunwayOptions): RunwayReport | undefined {
  const { actual, contributionMargin, costLines = [], recoveries = [], tiers = [] } = input;
  const revenue = actual.values[actual.revenueKey];
  if (!revenue || options.cash === undefined || !Number.isFinite(options.cash)) return undefined;

  const months = options.months ?? 12;
  const cash = options.cash;

  // The operating result, rebuilt from the lines we read. Two routes, because
  // files come in two shapes: with a gross margin line (annual accounts,
  // usually) the result is gross profit minus everything below it, and the
  // cost of sales must not be counted a second time. Without one, it is
  // turnover minus every cost, and that only means anything if the cost of
  // sales is actually among the costs — a management report that starts at
  // gross margin without saying so would otherwise read as wildly profitable.
  const tier1 = new Set(tiers.filter((t) => t.tier === 1).map((t) => t.key));
  const isCostOfSales = (line: { key: string; label: string }) =>
    tier1.has(line.key) || has(line.label, ["kostprijs", "inkoop", "cogs", "cost of"]);

  const sum = (lines: { key: string; label: string }[]) =>
    lines.reduce((total, line) => total + Math.abs(actual.values[line.key] ?? 0), 0);

  const credits = recoveries.reduce(
    (total, pair) => total + Math.abs(actual.values[pair.recovery] ?? 0),
    0,
  );

  let result: number;
  if (contributionMargin !== undefined) {
    const gross = contributionMargin * revenue;
    result = gross - sum(costLines.filter((line) => !isCostOfSales(line))) + credits;
  } else {
    if (!costLines.some(isCostOfSales)) return undefined;
    result = revenue - sum(costLines) + credits;
  }

  const depreciation = sum(costLines.filter((line) => has(line.label, NON_CASH)));

  // Cash view: the loss, minus the part of it that never left the bank.
  const cashResult = result + depreciation;
  const monthlyBurn = -cashResult / months;

  const lines: string[] = [];

  if (monthlyBurn <= 0) {
    lines.push(
      `At the pace of ${actual.label}, your operations added about ${euro(-monthlyBurn)} to the ` +
        `bank per month. Runway is not the question this file raises; what eats a company like ` +
        `this is working capital, and a profit and loss account cannot see it.`,
    );
  } else {
    const monthsLeft = cash / monthlyBurn;
    const when =
      monthsLeft >= 24
        ? "more than two years away at this pace"
        : monthsLeft >= 1
          ? `about ${monthsLeft.toFixed(1).replace(/\.0$/, "")} months away at this pace`
          : "less than one month away at this pace";
    lines.push(
      `Cash in the bank: ${euro(cash)}. Cash leaving, at the pace of ${actual.label}: about ` +
        `${euro(monthlyBurn)} per month.`,
      ``,
      `At that pace the bank account reaches zero ${when}.`,
    );
    if (monthsLeft < 6) {
      lines.push(
        ``,
        `A runway under six months is not a planning number, it is a calendar. The moves that ` +
          `change it are the ones from the margin report, and they take effect next month, not ` +
          `this one — which is the argument for making them now.`,
      );
    }
  }

  lines.push(
    ``,
    `What this number is, exactly: last period's pace, projected flat. It assumes next month ` +
      `looks like the average month of ${actual.label}. It does not know your seasonality, and ` +
      `it does not know your balance sheet: VAT quarters, customer prepayments, supplier terms ` +
      `and loan repayments all move the real date, in both directions. If your customers pay ` +
      `you before you pay your suppliers, the real runway is longer than this; if it is the ` +
      `other way round, shorter.`,
    ``,
    `Check: the period's result reads as ${signedEuro(result)} over ${months} months` +
      (depreciation > 0
        ? `, of which ${euro(depreciation)} is depreciation — money that left the bank in an ` +
          `earlier year, not this one. Cash movement ${signedEuro(cashResult)}, so ` +
          `${signedEuro(-monthlyBurn)} per month.`
        : `. No depreciation line found, so cash movement is taken as the result itself: ` +
          `${signedEuro(-monthlyBurn)} per month.`),
    ``,
    `We read ${actual.label} as ${months} months. If it covers a different stretch, say so and ` +
      `we run it again — the answer scales with it.`,
  );

  return {
    monthlyBurn,
    monthsLeft: monthlyBurn > 0 ? cash / monthlyBurn : undefined,
    text: lines.join("\n") + "\n",
  };
}
