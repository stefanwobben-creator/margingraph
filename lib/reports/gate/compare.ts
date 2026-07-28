import { quantise } from "./tolerance";
import type { Disagreement, Statement } from "./types";

/**
 * Where two statements of the same thing disagree.
 *
 * Layer three of the gate. A workbook that carries the same budget on two tabs
 * will eventually carry two different budgets, and the variance columns will
 * hang off whichever one the template happened to point at. Nobody notices,
 * because both tabs look finished.
 *
 * The comparison is by cell id, so it is the caller's job to give the same
 * figure the same id across statements. That is a real constraint and it is
 * the right one: deciding that two rows mean the same thing is a reading, and
 * readings belong at the edge where they can be corrected, not in here.
 */
export function disagreements(input: {
  left: Statement;
  right: Statement;
  /** Ignore differences at or below this. Defaults to the coarser precision. */
  tolerance?: number;
}): Disagreement[] {
  const { left, right } = input;
  const precision = Math.max(left.precision, right.precision);
  const tolerance = input.tolerance ?? precision;

  const rightCells = new Map(right.cells.map((c) => [c.id, c]));
  const found: Disagreement[] = [];

  for (const cell of left.cells) {
    const other = rightCells.get(cell.id);
    if (!other) continue;
    if (cell.value === null || other.value === null) {
      if (cell.value !== other.value) {
        found.push({
          cell: cell.id,
          label: cell.label,
          left: cell.value,
          right: other.value,
          difference: null,
        });
      }
      continue;
    }
    const difference = quantise(cell.value - other.value, precision);
    if (Math.abs(difference) > tolerance) {
      found.push({
        cell: cell.id,
        label: cell.label,
        left: cell.value,
        right: other.value,
        difference,
      });
    }
  }

  return found;
}
