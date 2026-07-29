import { portrait } from "./portrait";
import type { Finding, FindingsInput } from "./types";

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
  /** The total exposure, at the ceiling of every finding. */
  found: number;
  /** What the moves we would actually advise add up to. Never larger. */
  recommended: number;
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
  /** Total exposure across every finding, always shown. */
  found: number;
  /** What the moves we would actually advise add up to. Never larger. */
  recommended: number;
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

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

/** Wrap to a readable measure. Plain text still has a right-hand edge. */
function wrap(text: string, width: number, indent: string): string[] {
  const out: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    if (line && line.length + 1 + word.length > width) {
      out.push(indent + line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  if (line) out.push(indent + line);
  return out;
}

/**
 * Concept, then their case, then the money, then the move, then the sums.
 *
 * The order is the whole point. An owner who has never been told that freight
 * paid and freight billed on are two different lines cannot act on "you
 * recover 55.5% of your uitgaande vracht", however correct it is. Explaining
 * the thing before showing their instance of it costs three lines and turns a
 * report that proves we are clever into one that makes the reader cleverer.
 */
function block(f: Finding, index: number): string {
  const lead = f.plainly
    ? [
        ...wrap(f.plainly, 72, "   ").map((l, i) => (i === 0 ? `${index}.${l.slice(2)}` : l)),
        `   Yours:  ${f.observation}`,
      ]
    : [`${index}. ${f.observation}`];

  const lines = [
    ...lead,
    `   Worth:  ${euro(f.worth)} at most (${f.per}).`,
    `   Do:     ${f.action}`,
    `   Check:  ${f.workings}`,
  ];
  if (f.ladder?.length) {
    lines.push("   Steps:");
    const width = Math.max(...f.ladder.map((s) => s.move.length));
    for (const step of f.ladder) {
      const risk =
        step.breakEvenShare !== undefined
          ? `  safe while you lose under ${pct(step.breakEvenShare)} of turnover`
          : "";
      lines.push(`     ${step.move.padEnd(width)}  ${euro(step.worth).padStart(9)}${risk}`);
    }
  }
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
  const recommended = findings.reduce(
    (sum, f) => sum + Math.max(0, f.recommended ?? f.worth),
    0,
  );
  // Charged against what we would actually advise, not against the ceiling.
  // A guarantee measured on the bigger number is a guarantee measured on a
  // number nobody is going to collect.
  const chargeable = recommended >= MINIMUM_WORTH;

  const header = chargeable
    ? `Found ${euro(found)} of exposure. The moves we would actually recommend inside it are worth ${euro(recommended)}. Paid €${REPORT_PRICE}.`
    : `Found ${euro(recommended)} worth acting on. That is under our minimum, so this report is free.`;

  const biggest = findings[0];
  const shareable = biggest
    ? `I ran my figures through MarginGraph and it found ${euro(biggest.worth)} I had not seen.`
    : undefined;

  return {
    chargeable,
    found,
    recommended,
    findings,
    shareable,
    text: [header, ...findings.map((f, i) => block(f, i + 1))].join("\n\n").trimEnd() + "\n",
  };
}

/**
 * What the reader gets for nothing: the size, not the answer.
 *
 * An earlier version handed over the largest finding whole, workings and action
 * included, on the argument that a reader should be able to verify the method
 * before paying. That argument was right and the implementation was wrong: it
 * gave away the finding to prove the method. The proof now lives on a public
 * example page, run on a company that is not theirs, where it costs nothing.
 *
 * What is left here is what an owner needs to decide: we could read your file,
 * there are N things in it, the largest is worth this much, and here is what
 * each one is about. Which line, why, and what to do about it is the product.
 */
export function teaser(findings: Finding[], input?: FindingsInput): Teaser {
  const sorted = [...findings].sort((a, b) => b.worth - a.worth);
  const found = sorted.reduce((sum, f) => sum + Math.max(0, f.worth), 0);
  const recommended = sorted.reduce(
    (sum, f) => sum + Math.max(0, f.recommended ?? f.worth),
    0,
  );
  const unlockable = recommended >= MINIMUM_WORTH && sorted.length > 0;

  // Four facts about their own business, free, whatever we found. Somebody who
  // reads this knows something about their company they did not know a minute
  // ago, which is a better reason to keep reading than a number we are about
  // to charge for.
  const opening = input ? portrait(input).text : "";
  const head = opening ? `Here is what your file says.\n\n${opening}\n\n` : "";

  if (!unlockable) {
    return {
      found,
      recommended,
      count: sorted.length,
      locked: [],
      unlockable: false,
      text:
        head +
        `We read it looking for money you are leaving behind, and found ${euro(recommended)} worth acting on.\n\n` +
        `That is below the €${MINIMUM_WORTH} we hold ourselves to, so there is nothing to sell you ` +
        `and nothing to pay. If you want, send a different file.\n`,
    };
  }

  const [sample] = sorted;
  const locked = sorted.map((f) => f.subject);
  const width = Math.max(...locked.map((l) => l.length));

  // Two numbers, and the smaller one is the promise. The exposure is what is
  // at stake if everything went perfectly; the recommended figure is what we
  // would actually tell you to do on Monday, and it is the one the guarantee
  // is measured against.
  const summary =
    `We read it and found ${euro(found)} of exposure across ` +
    `${sorted.length} ${sorted.length === 1 ? "finding" : "findings"}. ` +
    (recommended < found
      ? `The moves we would actually recommend inside that are worth ${euro(recommended)}.`
      : `The largest is worth ${euro(sample.worth)} on its own.`);

  const list = sorted
    .map((f, i) => `  ${i + 1}. ${f.subject.padEnd(width)}  ${euro(f.worth).padStart(9)}`)
    .join("\n");

  return {
    found,
    recommended,
    count: sorted.length,
    sample,
    locked,
    unlockable: true,
    text:
      `${head}${summary}\n\nWhat we found, and what each one is worth:\n\n${list}\n\n` +
      `€${REPORT_PRICE} unlocks which line each of these sits on, the arithmetic ` +
      `behind it, and what to do about it including how far you can safely go.\n`,
  };
}
