/**
 * Intake.
 *
 * The step between a file somebody emailed and the lines the engine reads. It
 * was the only part of this product still done by hand, which made it the only
 * part that could not be tested and the only part that did not scale.
 */

export { readSheet } from "./read";
export type { ReadOptions } from "./read";
export type { Cell, ClassifiedRow, Intake, RowKind, Sheet } from "./types";
export { normalise } from "./vocabulary";
