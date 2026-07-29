import type { Finding, FindingsInput, Period } from "./types";

const euro = (n: number) =>
  `€${Math.round(Math.abs(n)).toLocaleString("nl-NL")}`;
const pct = (n: number) => `${(n * 100).toFixed(1).replace(".", ",")}%`;

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
      observation: `Je berekent ${pct(rate)} van je ${pair.label} door aan klanten.`,
      worth: gap,
      action: `Zet de ${pair.label}-regel op kostprijs, of leg een gratis-verzendgrens boven je gemiddelde orderwaarde.`,
      workings: `${euro(cost)} kosten tegen ${euro(recovered)} doorbelast is ${pct(rate)}. Volledig doorbelasten scheelt ${euro(gap)}.`,
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
        observation: `Je omzet ligt ${pct(drop)} onder ${reference.label}, en ${fired.length} van je ${tested} volume-afhankelijke kostenregels zijn niet meegegaan.`,
        worth,
        action: `Vraag per contract welk deel vast is en of er een minimumafname in staat. Begin bij ${fired.sort((a, b) => b.worth - a.worth)[0].label}.`,
        workings: `${fired
          .map((d) => `${d.label} ${pct(d.then)} naar ${pct(d.now)}`)
          .join(", ")}. Op de oude verhoudingen was dit samen ${euro(
          fired.reduce((s, d) => s + d.nowEur, 0) - worth,
        )} geweest in plaats van ${euro(fired.reduce((s, d) => s + d.nowEur, 0))}.`,
        source: [...fired.map((d) => d.key), actual.revenueKey],
        caveat: `Een deel van deze kosten is per definitie vast. Dit bedrag is de omvang van het gesprek, niet de gegarandeerde besparing.`,
      },
    ];
  }

  return fired.map((d) => ({
    id: `ratio-${d.key}`,
    per: actual.label,
    observation: `${d.label} ging van ${pct(d.then)} naar ${pct(d.now)} van je omzet, terwijl het bedrag zelf nauwelijks bewoog.`,
    worth: d.worth,
    action: `Vraag je leverancier welk deel van dit contract vast is en of er een minimumafname in staat.`,
    workings: `${euro(d.nowEur)} nu, maar op ${pct(d.then)} van de huidige omzet zou het ${euro(
      d.nowEur - d.worth,
    )} zijn. Verschil ${euro(d.worth)}.`,
    source: [d.key, actual.revenueKey],
    caveat: `Een deel van deze kosten is mogelijk vast. Dit bedrag is de omvang van het gesprek, niet de gegarandeerde besparing.`,
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
        observation: `${line.label} ligt ${euro(over)} boven ${reference.label}.`,
        worth: over,
        action: `Terug naar budget, of het budget bijstellen zodat je er weer op kunt sturen.`,
        workings: `${euro(now)} werkelijk tegen ${euro(planned)} begroot.`,
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
