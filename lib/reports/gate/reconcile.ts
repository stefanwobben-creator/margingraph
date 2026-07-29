import { quantise, toleranceFor } from "./tolerance";
import type {
  Cell,
  GateStatus,
  GateVerdict,
  Repair,
  Rollup,
  RollupCheck,
  Statement,
} from "./types";

function index(cells: Cell[]): Map<string, Cell> {
  const map = new Map<string, Cell>();
  for (const cell of cells) {
    if (map.has(cell.id)) {
      throw new Error(`duplicate cell id ${cell.id}: a statement must name each figure once`);
    }
    map.set(cell.id, cell);
  }
  return map;
}

/**
 * A blank line contributes nothing and is recorded rather than assumed away.
 *
 * Every real profit and loss has empty rows, so treating a blank as untestable
 * would put an amber on all of them and the gate would be ignored inside a
 * week. Treating it silently as zero is the other failure: a figure quietly
 * invented. So blanks count as zero and are listed, and if the subtotal then
 * fails they are named first, because a line that looked empty and was not is
 * the second most common way a statement stops adding up.
 */
function sum(
  rollup: Rollup,
  cells: Map<string, Cell>,
  precision: number,
): { total: number; counted: number; blanks: string[] } {
  let total = 0;
  let counted = 0;
  const blanks: string[] = [];
  for (const part of rollup.parts) {
    const cell = cells.get(part.cell);
    if (!cell || cell.value === null) {
      blanks.push(part.cell);
      continue;
    }
    total += part.sign * cell.value;
    counted += 1;
  }
  return { total: quantise(total, precision), counted, blanks };
}

/**
 * Every single sign flip that would close the gap.
 *
 * Deliberately limited to one flip. Two flips can close almost any gap by
 * coincidence, and a diagnosis that fits everything diagnoses nothing. If no
 * single flip works, that is the finding: the stated figure does not follow
 * from the rows above it under any reading of their signs, so it did not come
 * from them.
 */
function repairsFor(
  rollup: Rollup,
  cells: Map<string, Cell>,
  stated: number,
  precision: number,
  tolerance: number,
): Repair[] {
  const found: Repair[] = [];
  for (const part of rollup.parts) {
    const cell = cells.get(part.cell);
    if (!cell || cell.value === null) continue;
    const flipped: Rollup = {
      id: rollup.id,
      parts: rollup.parts.map((p) =>
        p.cell === part.cell ? { cell: p.cell, sign: (p.sign * -1) as 1 | -1 } : p,
      ),
    };
    const { total } = sum(flipped, cells, precision);
    if (Math.abs(quantise(stated - total, precision)) <= tolerance) {
      found.push({ cell: part.cell, from: part.sign, to: (part.sign * -1) as 1 | -1 });
    }
  }
  return found;
}

function checkRollup(
  rollup: Rollup,
  cells: Map<string, Cell>,
  precision: number,
): RollupCheck {
  const target = cells.get(rollup.id);
  const label = target?.label ?? rollup.id;
  const { total, counted, blanks } = sum(rollup, cells, precision);
  const tolerance = toleranceFor({ parts: counted, precision });
  const stated = target?.value ?? null;

  // Untestable, which is different from wrong. Either the subtotal itself is
  // absent, or there is nothing beneath it to add up.
  if (stated === null || counted === 0) {
    return {
      rollup: rollup.id,
      label,
      status: "incomplete",
      stated,
      computed: counted > 0 ? total : null,
      drift: null,
      tolerance,
      counted,
      missing: stated === null ? [...blanks, rollup.id] : blanks,
      repairs: [],
    };
  }

  const drift = quantise(stated - total, precision);
  const ok = Math.abs(drift) <= tolerance;

  // A total that overshoots the parts of an admittedly partial list is the
  // signature of a component that was never published. Undershooting is not:
  // an unseen part cannot make a total smaller, so that stays a mismatch.
  const shortfall = !ok && rollup.complete === false && drift > 0;

  return {
    rollup: rollup.id,
    label,
    status: ok ? "ok" : shortfall ? "shortfall" : "mismatch",
    stated,
    computed: total,
    drift,
    tolerance,
    counted,
    missing: blanks,
    repairs: ok || shortfall ? [] : repairsFor(rollup, cells, stated, precision, tolerance),
  };
}

function describe(status: GateStatus, checks: RollupCheck[], label: string): string {
  if (status === "red") {
    return `${label}: nothing here could be checked. No subtotal had enough figures beneath it to test.`;
  }
  if (status === "green") {
    return `${label}: every subtotal reproduces from the figures beneath it. Read correctly.`;
  }
  const bad = checks.filter((c) => c.status !== "ok");
  const parts = bad.map((c) => {
    if (c.status === "incomplete") {
      return `${c.label} could not be tested (${c.missing.join(", ")} absent)`;
    }
    if (c.status === "shortfall") {
      return `${c.label} is stated as ${c.stated} and the lines we could read only reach ${c.computed}, so ${c.drift} of it was never published. That is a gap in the file, not in the figures`;
    }
    const gap = c.drift ?? 0;
    const repair =
      c.repairs.length === 1
        ? `, which one sign flip on ${c.repairs[0].cell} would close`
        : c.repairs.length === 0
          ? ", which no single sign reading of its own parts closes"
          : `, which ${c.repairs.length} different single sign flips would close`;
    const blanks =
      c.missing.length > 0 ? ` (blank lines beneath it: ${c.missing.join(", ")})` : "";
    return `${c.label} is stated as ${c.stated} but its parts give ${c.computed}, a gap of ${gap}${repair}${blanks}`;
  });
  return `${label}: ${parts.join("; ")}.`;
}

/**
 * Run the arithmetic test over a statement.
 *
 * The verdict is a state, not a score. A score invites a threshold, a
 * threshold invites tuning, and tuning is how a gate stops being a gate.
 */
export function reconcile(statement: Statement): GateVerdict {
  const cells = index(statement.cells);
  const checks = statement.rollups.map((r) => checkRollup(r, cells, statement.precision));

  const testable = checks.filter((c) => c.status !== "incomplete");
  const failed = checks.filter((c) => c.status === "mismatch" || c.status === "shortfall");
  const contradicted = checks.filter((c) => c.status === "mismatch");

  const status: GateStatus =
    testable.length === 0 ? "red" : failed.length > 0 || checks.length > testable.length ? "amber" : "green";

  const blocking = checks
    .filter((c) => c.status !== "ok")
    .map((c) => c.rollup);

  return {
    statement: statement.id,
    status,
    chargeable: contradicted.length > 0,
    checks,
    blocking,
    summary: describe(status, checks, statement.label),
  };
}
