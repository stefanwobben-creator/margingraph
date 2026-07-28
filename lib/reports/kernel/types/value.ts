/**
 * A quantity, kept structured rather than formatted.
 *
 * The kernel never formats. A renderer decides how €2.4M appears; the kernel
 * only knows the amount, the unit and how wide the range around it is.
 */
export type Quantity = {
  amount: number;
  /** ISO currency code, "%", "months", "count" — opaque to the kernel. */
  unit: string;
  /** When the value is a range rather than a point. */
  low?: number;
  high?: number;
};

/** True when two quantities are comparable at all. */
export function comparable(a: Quantity, b: Quantity): boolean {
  return a.unit === b.unit;
}

/**
 * Relative distance between two quantities, used to detect contradictions
 * without knowing what they measure.
 */
export function relativeGap(a: Quantity, b: Quantity): number {
  const scale = Math.max(Math.abs(a.amount), Math.abs(b.amount));
  if (scale === 0) return 0;
  return Math.abs(a.amount - b.amount) / scale;
}

/** True when the stated ranges overlap; a point value is a zero-width range. */
export function rangesOverlap(a: Quantity, b: Quantity): boolean {
  const aLow = a.low ?? a.amount;
  const aHigh = a.high ?? a.amount;
  const bLow = b.low ?? b.amount;
  const bHigh = b.high ?? b.amount;
  return aLow <= bHigh && bLow <= aHigh;
}
