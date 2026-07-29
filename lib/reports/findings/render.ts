import type { Finding } from "./types";

const euro = (n: number) => `€${Math.round(Math.abs(n)).toLocaleString("nl-NL")}`;

/** The price of a report. The header compares it to what was found. */
export const REPORT_PRICE = 9;

/**
 * The threshold under which we do not charge.
 *
 * Ten times the price. It is a number an owner believes, unlike the ratios a
 * good file produces, and it is low enough that almost any real document
 * clears it. Setting it here rather than in a config is on purpose: it is a
 * promise, not a parameter.
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
 * Four lines per finding, and nothing else.
 *
 * Plain text on purpose. If the finding does not survive being printed without
 * formatting, the finding is not the problem, the formatting was carrying it.
 */
export function render(findings: Finding[]): Report {
  const found = findings.reduce((sum, f) => sum + Math.max(0, f.worth), 0);
  const chargeable = found >= MINIMUM_WORTH;

  const header = chargeable
    ? `Gevonden ${euro(found)}. Betaald €${REPORT_PRICE}.`
    : `Gevonden ${euro(found)}. Dat is te weinig, dus dit rapport is gratis.`;

  const body = findings.map((f, i) => {
    const lines = [
      `${i + 1}. ${f.observation}`,
      `   Waard: ${euro(f.worth)} (${f.per}).`,
      `   Doen:  ${f.action}`,
      `   Check: ${f.workings}`,
    ];
    if (f.caveat) lines.push(`   Let op: ${f.caveat}`);
    return lines.join("\n");
  });

  const biggest = findings[0];
  const shareable = biggest
    ? `Ik heb mijn cijfers door MarginGraph gehaald en er kwam ${euro(biggest.worth)} uit dat ik zelf niet had gezien.`
    : undefined;

  return {
    chargeable,
    found,
    findings,
    shareable,
    text: [header, ...body].join("\n\n").trimEnd() + "\n",
  };
}
