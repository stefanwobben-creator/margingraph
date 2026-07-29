import type { FindingsInput } from "@/lib/reports/findings";

/**
 * A spreadsheet, as flatly as it can be described.
 *
 * Deliberately not an xlsx type. Whatever put the file on disk, by the time it
 * gets here it is a grid of strings, numbers and blanks, and the reading logic
 * can then be tested without a binary fixture. `scripts/sheet-to-rows.py`
 * produces this shape from .xlsx and .csv alike.
 */
export type Cell = string | number | null;
export type Sheet = { name: string; rows: Cell[][] };

/** What we decided a row is. `skip` carries the reason. */
export type RowKind =
  | "revenue"
  | "recovery"
  | "variable"
  | "cost"
  | "margin"
  | "subtotal"
  | "skip";

/**
 * One row of the file and what we made of it.
 *
 * The audit trail is the point. A reader that quietly decides which line is
 * turnover is a reader nobody can check, and the whole product rests on
 * findings that can be checked. Every row that went in comes back out here
 * with the classification attached, including the ones we ignored.
 */
export type ClassifiedRow = {
  /** Zero-based row index in the source sheet, so a person can go and look. */
  row: number;
  label: string;
  /** Slug used as the cell id downstream. */
  key: string;
  kind: RowKind;
  /** Why, in one phrase. Always present for `skip` and `subtotal`. */
  because?: string;
  actual: number | null;
  reference: number | null;
};

export type ColumnChoice = {
  index: number;
  header: string;
};

export type Intake = {
  /**
   * Whether the file can be run.
   *
   * False does not mean the file is bad. It means we could not decide
   * something we refuse to guess at, and `questions` says what. A reader that
   * guesses produces a report nobody can defend, which is worse than no report
   * at all: the first is a refund, the second is the whole product.
   */
  readable: boolean;
  input?: FindingsInput;
  /** Blocking. Each one is a question a person can answer in one line. */
  questions: string[];
  /** Non-blocking decisions the reader made, stated out loud. */
  notes: string[];
  /** Every row of the sheet and what became of it. */
  rows: ClassifiedRow[];
  columns?: { actual: ColumnChoice; reference?: ColumnChoice; label: number };
};
