/**
 * How much a subtotal is allowed to miss by.
 *
 * Rounding is the only legitimate reason a correct statement fails to add up.
 * A figure printed to a precision of p carries at most p/2 of hidden error, so
 * a subtotal of n rounded parts drifts by at most n * p/2, and the subtotal is
 * itself rounded, which adds one more half step.
 *
 *     tolerance = (n + 1) * p / 2
 *
 * Derived, never configured. The moment a tolerance becomes a setting, someone
 * widens it to make a red build go away and the gate stops meaning anything.
 * Eleven lines reported in thousands to one decimal get 0.60 of room, and that
 * is the entire argument.
 */
export function toleranceFor(input: {
  parts: number;
  precision: number;
}): number {
  const { parts, precision } = input;
  if (!Number.isFinite(precision) || precision < 0) {
    throw new RangeError(`precision must be a non-negative number, got ${precision}`);
  }
  if (!Number.isInteger(parts) || parts < 0) {
    throw new RangeError(`parts must be a non-negative integer, got ${parts}`);
  }
  // Quantised for the same reason the drift is: (11 + 1) * 0.1 / 2 evaluates
  // to 0.6000000000000001, and a tolerance printed in an amber message should
  // be a number a reader recognises.
  return quantise(((parts + 1) * precision) / 2, precision);
}

/**
 * Floating point addition of decimal figures does not land where a reader
 * expects, and a gate that fails on 0.30000000000000004 is worse than no gate.
 * Every comparison here runs through this, at a scale taken from the source's
 * own precision rather than a constant.
 */
export function quantise(value: number, precision: number): number {
  if (precision <= 0 || !Number.isFinite(value)) return value;
  // Two decimal places below the source precision: enough to keep real
  // differences and drop the representation noise that produced them.
  //
  // Rounded through a fixed number of decimals rather than by dividing and
  // multiplying by a step. Multiplying back by 0.001 is itself inexact, which
  // is how 147.2 became 147.20000000000002 the first time this was written.
  const decimals = Math.min(20, Math.max(0, Math.ceil(-Math.log10(precision)) + 2));
  return Number(value.toFixed(decimals));
}
