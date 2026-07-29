import type { Finding } from "./types";

const euro = (n: number) => `€${Math.round(Math.abs(n)).toLocaleString("en-GB")}`;

/** The price of a report. Every headline compares it to what was found. */
export const REPORT_PRICE = 9;

/**
 * The threshold under which we do not charge.
 *
 * Ten times the price. It is a ratio an owner believes, unlike the ones a good
 * file actually produces, and it is low enough that almost any real document
 * clears it. It lives here rather than in a config because it is a promise,
 * not a parameter.
 */
export const MINIMUM_WORTH = REPORT_PRICE * 10;

export type Report = {
  /** True when we found enough to charge for. */
  chargeable: boolean;
  found: number;
  findings: Finding[];
  /** One line the owner can forward without giving anything away. */
  shareable?: string;
  text: string;
};

/**
 * What the reader sees before paying.
 *
 * The order is deliberate: analyse first, charge second. The teaser is not a
 * marketing device, it is the guarantee made mechanical. If the engine found
 * less than the minimum there is nothing to unlock, so no payment screen
 * appears and no refund ever has to be processed. A promise that costs nothing
 * to keep is a promise that survives a bad week.
 *
 * One finding is shown in full, including its workings, so the reader can
 * verify the method on real figures from their own file before spending
 * anything. What is withheld is the other findings, not the proof.
 */
export type Teaser = {
  /** Total found across every finding, always shown. */
  found: number;
  /** How many findings there are, always shown. */
  count: number;
  /** The largest finding, complete. Absent when nothing was found. */
  sample?: Finding;
  /** One line per withheld finding: what it is about, not what it is worth. */
  locked: string[];
  /** False when there is nothing to sell, and then there is no paywall. */
  unlockable: boolean;
  text: string;
};

function block(f: Finding, index: number): string {
  const lines = [
    `${index}. ${f.observation}`,
    `   Worth:  ${euro(f.worth)} (${f.per}).`,
    `   Do:     ${f.action}`,
    `   Check:  ${f.workings}`,
  ];
  if (f.caveat) lines.push(`   Note:   ${f.caveat}`);
  return lines.join("\n");
}

/**
 * Four lines per finding, and nothing else.
 *
 * Plain text on purpose. If a finding does not survive being printed without
 * formatting, the finding was not the thing carrying it.
 */
export function render(findings: Finding[]): Report {
  const found = findings.reduce((sum, f) => sum + Math.max(0, f.worth), 0);
  const chargeable = found >= MINIMUM_WORTH;

  const header = chargeable
    ? `Found ${euro(found)}. Paid €${REPORT_PRICE}.`
    : `Found ${euro(found)}. That is under our minimum, so this report is free.`;

  const biggest = findings[0];
  const shareable = biggest
    ? `I ran my figures through MarginGraph and it found ${euro(biggest.worth)} I had not seen.`
    : undefined;

  return {
    chargeable,
    found,
    findings,
    shareable,
    text: [header, ...findings.map((f, i) => block(f, i + 1))].join("\n\n").trimEnd() + "\n",
  };
}

/**
 * The same findings, with everything but the largest one held back.
 *
 * Locked lines name the subject and never the amount. "Your outbound freight
 * recovery" tells a reader whether it is worth nine euros to them; "€36,400 on
 * outbound freight" is the finding itself, given away.
 */
export function teaser(findings: Finding[]): Teaser {
  const sorted = [...findings].sort((a, b) => b.worth - a.worth);
  const found = sorted.reduce((sum, f) => sum + Math.max(0, f.worth), 0);
  const unlockable = found >= MINIMUM_WORTH && sorted.length > 0;

  if (!unlockable) {
    return {
      found,
      count: sorted.length,
      locked: [],
      unlockable: false,
      text:
        `We read your file and found ${euro(found)}.\n\n` +
        `That is below the €${MINIMUM_WORTH} we hold ourselves to, so there is nothing to sell you ` +
        `and nothing to pay. If you want, send a different file.\n`,
    };
  }

  const [sample, ...rest] = sorted;
  const locked = rest.map((f) => f.subject);

  const head =
    rest.length === 0
      ? `We found ${euro(found)} in your file. Here it is in full.`
      : `We found ${euro(found)} across ${sorted.length} findings in your file. ` +
        `Here is the largest one in full, so you can check the arithmetic before you decide.`;

  const tail =
    rest.length === 0
      ? ""
      : `\n\nStill locked (€${REPORT_PRICE} for all of them):\n` +
        rest.map((_, i) => `  ${i + 2}. ${locked[i]}`).join("\n");

  return {
    found,
    count: sorted.length,
    sample,
    locked,
    unlockable: true,
    text: `${head}\n\n${block(sample, 1)}${tail}\n`,
  };
}
