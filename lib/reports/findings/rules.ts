import type { Finding, FindingsInput, Period } from "./types";

const euro = (n: number) =>
  `€${Math.round(Math.abs(n)).toLocaleString("en-GB")}`;
const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

function share(period: Period, key: string): number | undefined {
  const value = period.values[key];
  const revenue = period.values[period.revenueKey];
  if (value === undefined || !revenue) return undefined;
  return value / revenue;
}

/**
 * Recovery gap.
 *
 * A cost you bill on to customers, and the line that bills it. If the second
 * is smaller than the first, the difference is margin you decided not to
 * charge for, usually years ago and usually by accident.
 *
 * Stated against full recovery, not against an industry target. Inventing a
 * benchmark here would be the same error as putting a trading multiple on a
 * holiday park: a number that looks authoritative and comes from nowhere. How
 * far up to go is the owner's call, and the finding gives them the ceiling.
 */
export function recoveryGap(input: FindingsInput): Finding[] {
  const { actual, recoveries = [] } = input;
  const out: Finding[] = [];

  for (const pair of recoveries) {
    const cost = actual.values[pair.cost];
    // Recovery lines are carried as credits, so magnitude is what matters.
    const recovered = Math.abs(actual.values[pair.recovery] ?? NaN);
    if (!Number.isFinite(cost) || !Number.isFinite(recovered) || cost <= 0) continue;

    const rate = recovered / cost;
    if (rate >= 0.995) continue;

    const gap = cost - recovered;
    out.push({
      id: `recovery-${pair.recovery}`,
      per: actual.label,
      subject: `How much of your ${pair.label} you recover from customers`,
      observation: `You recover ${pct(rate)} of your ${pair.label} from customers.`,
      worth: gap,
      action: `Reprice the ${pair.label} line to cost, or set a free-shipping threshold above your current average order value.`,
      workings: `${euro(cost)} of cost against ${euro(recovered)} recovered is ${pct(rate)}. Full recovery is worth ${euro(gap)}.`,
      source: [pair.cost, pair.recovery],
    });
  }

  return out;
}

type Drift = {
  key: string;
  label: string;
  now: number;
  then: number;
  nowEur: number;
  worth: number;
};

function drifts(input: FindingsInput): { tested: number; fired: Drift[] } {
  const { actual, reference, variableLines = [] } = input;
  if (!reference) return { tested: 0, fired: [] };

  let tested = 0;
  const fired: Drift[] = [];

  for (const line of variableLines) {
    const now = share(actual, line.key);
    const then = share(reference, line.key);
    const nowEur = actual.values[line.key];
    const thenEur = reference.values[line.key];
    if (now === undefined || then === undefined || !then) continue;
    if (nowEur === undefined || thenEur === undefined) continue;
    tested += 1;

    const ratioMove = Math.abs(now / then - 1);
    const euroMove = thenEur === 0 ? Infinity : Math.abs(nowEur / thenEur - 1);

    // The signature: the share of turnover moved and the euros did not. A line
    // that grew in both is an ordinary overspend, and their accounting package
    // already told them about it.
    if (now <= then || ratioMove < 0.2 || euroMove > ratioMove / 2) continue;

    const worth = nowEur - then * actual.values[actual.revenueKey];
    if (worth <= 0) continue;
    fired.push({ key: line.key, label: line.label, now, then, nowEur, worth });
  }

  return { tested, fired };
}

/**
 * Cost lines whose share of turnover moved harder than the line itself.
 *
 * This is the rule that caught a fulfilment contract three quarters before the
 * annual accounts would have. In euros the line looked fine: five thousand over
 * budget on a hundred thousand. As a share of turnover it had nearly doubled,
 * because turnover had halved and the contract had not noticed.
 *
 * Only lines the caller marks as volume-variable are tested. Run it over
 * payroll and it will confidently report that wages are too high in a quarter
 * where wages came in under budget, which is worse than saying nothing.
 *
 * When most of the tested lines fire at once, they are not several findings.
 * They are one finding about turnover, and reporting them separately would be
 * padding a report to clear its own price.
 */
export function ratioDrift(input: FindingsInput): Finding[] {
  const { actual, reference } = input;
  if (!reference) return [];
  const { tested, fired } = drifts(input);
  if (fired.length === 0) return [];

  const revenueNow = actual.values[actual.revenueKey];
  const revenueThen = reference.values[reference.revenueKey];

  if (tested >= 3 && fired.length > tested / 2) {
    const worth = fired.reduce((sum, d) => sum + d.worth, 0);
    const drop = 1 - revenueNow / revenueThen;
    return [
      {
        id: "ratio-cost-base",
        per: actual.label,
        subject: `Cost lines that did not follow your turnover down`,
        observation: `Your turnover is ${pct(drop)} below ${reference.label}, and ${fired.length} of your ${tested} volume-variable cost lines did not follow it down.`,
        worth,
        action: `Ask each supplier which part of the contract is fixed and whether it carries a minimum commitment. Start with ${fired.sort((a, b) => b.worth - a.worth)[0].label}.`,
        workings: `${fired
          .map((d) => `${d.label} ${pct(d.then)} to ${pct(d.now)}`)
          .join(", ")}. At the old ratios these would together have cost ${euro(
          fired.reduce((s, d) => s + d.nowEur, 0) - worth,
        )} instead of ${euro(fired.reduce((s, d) => s + d.nowEur, 0))}.`,
        source: [...fired.map((d) => d.key), actual.revenueKey],
        caveat: `Part of this cost is fixed by definition. The figure is the size of the conversation, not a guaranteed saving.`,
      },
    ];
  }

  return fired.map((d) => ({
    id: `ratio-${d.key}`,
    per: actual.label,
    subject: `${d.label} as a share of turnover`,
    observation: `${d.label} went from ${pct(d.then)} to ${pct(d.now)} of turnover while the amount itself barely moved.`,
    worth: d.worth,
    action: `Ask this supplier which part of the contract is fixed and whether it carries a minimum commitment.`,
    workings: `${euro(d.nowEur)} now, but at ${pct(d.then)} of current turnover it would be ${euro(
      d.nowEur - d.worth,
    )}. Difference ${euro(d.worth)}.`,
    source: [d.key, actual.revenueKey],
    caveat: `Part of this cost may be fixed. The figure is the size of the conversation, not a guaranteed saving.`,
  }));
}

/**
 * Plain budget overrun, kept deliberately dumb.
 *
 * Their accounting package shows this already, so it never leads a report and
 * it only fires above the price of one. It earns its place because it is the
 * rule that can always find something, which is what matters on a file where
 * the interesting rules find nothing.
 */
export function budgetOverrun(input: FindingsInput, floor = 90): Finding[] {
  const { actual, reference, costLines = [] } = input;
  if (!reference) return [];

  return costLines
    .map((line) => {
      const now = actual.values[line.key];
      const planned = reference.values[line.key];
      if (now === undefined || planned === undefined) return undefined;
      const over = now - planned;
      if (over < floor) return undefined;
      return {
        id: `overrun-${line.key}`,
        per: actual.label,
        subject: `${line.label} against budget`,
        observation: `${line.label} is ${euro(over)} over ${reference.label}.`,
        worth: over,
        action: `Bring it back to budget, or restate the budget so it is worth steering by again.`,
        workings: `${euro(now)} actual against ${euro(planned)} budgeted.`,
        source: [line.key],
      } satisfies Finding;
    })
    .filter((f): f is Finding => f !== undefined);
}

/** Everything, biggest first. Ties broken by id so the order is stable. */
export function findAll(input: FindingsInput): Finding[] {
  const ratio = ratioDrift(input);
  const covered = new Set(ratio.flatMap((f) => f.source));

  const all = [
    ...recoveryGap(input),
    ...ratio,
    // An overrun on a line a ratio finding already covers is the same money
    // counted twice. The ratio version says more, so it wins.
    ...budgetOverrun(input).filter((f) => !f.source.some((s) => covered.has(s))),
  ];

  return all.sort((a, b) => b.worth - a.worth || a.id.localeCompare(b.id));
}
