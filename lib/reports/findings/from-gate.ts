import type { Disagreement, GateVerdict } from "@/lib/reports/gate";
import type { Finding } from "./types";

const euro = (n: number, scale: number) =>
  `€${Math.round(Math.abs(n) * scale).toLocaleString("en-GB")}`;

/**
 * The amber verdict, turned into a finding.
 *
 * A subtotal that does not follow from its parts is not a technical complaint.
 * It is a number somebody has been steering by, and the size of the error is
 * the size of the finding. On the file that prompted this module it was the
 * largest single item, and it came out of addition rather than analysis.
 *
 * `scale` converts the statement's unit into euros. Management reports are
 * usually in thousands, and a finding of "147,2" helps nobody.
 */
export function reconciliationFindings(
  verdict: GateVerdict,
  options: { scale?: number; periodLabel?: string } = {},
): Finding[] {
  const scale = options.scale ?? 1;
  const where = options.periodLabel ? ` in ${options.periodLabel}` : "";

  return verdict.checks
    // Only a contradiction. A shortfall says a line was never published,
    // which is a question for the owner and worth nothing to sell.
    .filter((c) => c.status === "mismatch" && c.drift !== null)
    .map((c) => {
      const drift = c.drift as number;
      const single = c.repairs.length === 1 ? c.repairs[0] : undefined;

      const action = single
        ? `Check the sign on ${single.cell}. Flipping that one line closes the gap exactly.`
        : `Replace this cell with the sum of the lines above it, or find the version that does add up.`;

      const observation = single
        ? `${c.label}${where} does not add up, and the gap is exactly one flipped sign.`
        : `${c.label}${where} does not follow from the lines above it under any reading of their signs.`;

      return {
        id: `reconcile-${c.rollup}`,
        per: options.periodLabel ?? "this period",
        subject: `${c.label} does not follow from the lines above it`,
        observation,
        worth: Math.abs(drift) * scale,
        action,
        workings: `It states ${euro(c.stated ?? 0, scale)}; the lines above give ${euro(c.computed ?? 0, scale)}. Gap ${euro(drift, scale)}, against ${euro(c.tolerance, scale)} of legitimate rounding.`,
        source: [c.rollup, ...c.repairs.map((r) => r.cell)],
      } satisfies Finding;
    });
}

/**
 * Two versions of the same figure, in one file.
 *
 * Sharper than a reconciliation finding, because here we know which one is
 * right: the statement that reconciles wins over the one that does not. The
 * amount is the practical error, which is the difference between the two
 * versions rather than the distance from a broken cell to its own parts.
 *
 * `trusted` names the statement that passed the gate. Without one this rule
 * says nothing, because "these disagree" is a shrug and "you are steering by
 * the wrong one" is a finding.
 */
export function disagreementFindings(input: {
  found: Disagreement[];
  trusted: "left" | "right";
  trustedLabel: string;
  steeredByLabel: string;
  scale?: number;
  /** Only report the bottom-line effect, not every line that inherited it. */
  focus?: string[];
}): Finding[] {
  const scale = input.scale ?? 1;
  const relevant = input.focus
    ? input.found.filter((d) => input.focus?.includes(d.cell))
    : input.found;

  return relevant
    .filter((d) => d.difference !== null && d.difference !== 0)
    .map((d) => {
      const right = input.trusted === "left" ? d.left : d.right;
      const wrong = input.trusted === "left" ? d.right : d.left;
      const gap = Math.abs((d.difference as number) * scale);
      return {
        id: `disagree-${d.cell}`,
        per: input.trustedLabel,
        subject: `${d.label} carries two different values in this file`,
        observation: `${d.label} appears twice in this file: ${euro(wrong ?? 0, scale)} on one tab and ${euro(right ?? 0, scale)} on the other.`,
        worth: gap,
        action: `Steer by ${input.trustedLabel}. Replace the column in ${input.steeredByLabel}, because your variance reporting hangs off it.`,
        workings: `${input.trustedLabel} reconciles with the lines above it; ${input.steeredByLabel} does not. Difference ${euro(d.difference as number, scale)}.`,
        source: [d.cell],
      } satisfies Finding;
    });
}
