import type { Finding, FindingsInput, LadderStep, Period } from "./types";

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
/**
 * A ladder of partial moves, priced.
 *
 * The steps are deliberately small at the bottom. A recovery rate sitting at
 * 55% is a price the market accepted, not a clerical error, and an owner told
 * to go straight to 100% will either ignore the advice or lose customers
 * proving it wrong. Five points is a change most buyers absorb; the ceiling is
 * shown last because it is the arithmetic limit, not a recommendation.
 */
function recoveryLadder(input: {
  cost: number;
  recovered: number;
  revenue?: number;
  contributionMargin?: number;
}): LadderStep[] {
  const { cost, recovered, revenue, contributionMargin } = input;
  const rate = recovered / cost;
  const headroom = 1 - rate;
  const steps = [0.05, 0.1, 0.25].filter((s) => s < headroom);

  return [...steps, headroom].map((step) => {
    const worth = cost * step;
    const breakEvenRevenue =
      contributionMargin && contributionMargin > 0 ? worth / contributionMargin : undefined;
    return {
      move:
        step === headroom
          ? `Recover all of it (${pct(rate)} to 100%)`
          : `Recover ${(step * 100).toFixed(0)} more points (${pct(rate)} to ${pct(rate + step)})`,
      worth,
      breakEvenRevenue,
      breakEvenShare:
        breakEvenRevenue !== undefined && revenue ? breakEvenRevenue / revenue : undefined,
    } satisfies LadderStep;
  });
}

/**
 * Recovery gap.
 *
 * A cost you bill on to customers, and the line that bills it. If the second
 * is smaller than the first, the difference is margin you are not charging for.
 *
 * The headline amount is the ceiling, not the advice. Full recovery is the only
 * limit that does not come out of thin air, so it is what the gap is measured
 * against, but the ladder underneath it is what an owner actually acts on.
 */
export function recoveryGap(input: FindingsInput): Finding[] {
  const { actual, recoveries = [], contributionMargin } = input;
  const revenue = actual.values[actual.revenueKey];
  const out: Finding[] = [];

  for (const pair of recoveries) {
    const cost = actual.values[pair.cost];
    // Recovery lines are carried as credits, so magnitude is what matters.
    const recovered = Math.abs(actual.values[pair.recovery] ?? NaN);
    if (!Number.isFinite(cost) || !Number.isFinite(recovered) || cost <= 0) continue;

    const rate = recovered / cost;
    if (rate >= 0.995) continue;

    const gap = cost - recovered;
    const ladder = recoveryLadder({ cost, recovered, revenue, contributionMargin });
    const first = ladder[0];

    const action =
      first.breakEvenShare !== undefined
        ? `${first.move}. Worth ${euro(first.worth)}, and it stays worth it as long as it costs you less than ${pct(first.breakEvenShare)} of turnover in lost business.`
        : `${first.move}, worth ${euro(first.worth)}. Start small: this rate is a price your customers accepted, so a jump to full recovery buys an argument you do not need.`;

    out.push({
      id: `recovery-${pair.recovery}`,
      per: actual.label,
      plainly:
        `A cost you pay and the line that bills it back to customers are two ` +
        `separate rows. When the second is smaller than the first, the ` +
        `difference is being paid out of your own margin, usually because a ` +
        `rate was set years ago and the cost moved since.`,
      subject: `How much of your ${pair.label} you recover from customers`,
      observation: `You recover ${pct(rate)} of your ${pair.label} from customers.`,
      worth: gap,
      recommended: first.worth,
      action,
      workings: `${euro(cost)} of cost against ${euro(recovered)} recovered is ${pct(rate)}. The remaining ${euro(gap)} is the ceiling, reached only at full recovery.`,
      source: [pair.cost, pair.recovery],
      ladder,
      caveat: contributionMargin
        ? undefined
        : `We could not work out what you keep on the next euro of revenue, so the ladder shows what each step earns but not what it can safely cost. Send a gross margin figure and we will price the risk too.`,
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
        plainly:
          `A cost that moves with volume should fall when turnover falls. ` +
          `When several of them stay roughly the same in euros while turnover ` +
          `drops, they are taking a bigger share of a smaller company, and ` +
          `nothing in your accounts flags it because every line is close to ` +
          `budget on its own.`,
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
    plainly:
      `A cost that moves with volume should fall when turnover falls. When ` +
      `the amount stays roughly the same while its share of turnover jumps, ` +
      `the contract stopped following your business.`,
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

  // The floor is whichever is larger: the price of ten reports, or a quarter
  // of a percent of turnover. On a company doing four hundred thousand a
  // quarter the flat floor let through twenty-one overruns, most of them a few
  // hundred euros, and a report with twenty-one items in it says nothing at
  // all. An amount too small to be worth a conversation is not a finding.
  const revenue = actual.values[actual.revenueKey] ?? 0;
  const threshold = Math.max(floor, revenue * 0.0025);

  return costLines
    .map((line): Finding | undefined => {
      const now = actual.values[line.key];
      const planned = reference.values[line.key];
      if (now === undefined || planned === undefined) return undefined;
      const over = now - planned;
      if (over < threshold) return undefined;
      return {
        id: `overrun-${line.key}`,
        per: actual.label,
        plainly:
          `The plain comparison your accounting package already makes: what ` +
          `you spent against what you planned to spend. It is here because a ` +
          `budget nobody looks at is the same as no budget.`,
        subject: `${line.label} against ${reference.label}`,
        observation: `${line.label} is ${euro(over)} over ${reference.label}.`,
        worth: over,
        // "budget" was hardcoded here, so a comparison against last year read
        // "€2,188,180 budgeted" about a number nobody ever budgeted. The
        // reference's own name is always right, whichever kind it is.
        action: `Bring it back to the ${reference.label} level, or decide out loud that the new level is the plan.`,
        workings: `${euro(now)} actual against ${euro(planned)} in ${reference.label}.`,
        source: [line.key],
      };
    })
    .filter((f): f is Finding => f !== undefined);
}

/** Everything, biggest first. Ties broken by id so the order is stable. */
export function findAll(input: FindingsInput): Finding[] {
  const ratio = ratioDrift(input);
  const covered = new Set(ratio.flatMap((f) => f.source));

  // The weakest rule, so it is capped. Their accounting package already shows
  // every one of these, and a report whose length comes from the dumbest rule
  // in the set is a report padded to clear its own price.
  const overruns = budgetOverrun(input)
    .filter((f) => !f.source.some((s) => covered.has(s)))
    .sort((a, b) => b.worth - a.worth)
    .slice(0, 3);

  const all = [...recoveryGap(input), ...ratio, ...overruns];

  return all.sort((a, b) => b.worth - a.worth || a.id.localeCompare(b.id));
}
