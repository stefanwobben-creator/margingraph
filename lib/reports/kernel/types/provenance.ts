/**
 * Where a value came from.
 *
 * Every Evidence item carries one. There is no way to construct evidence
 * without it, which is the point: provenance added later covers nothing
 * produced earlier, and the reports produced earliest are the ones the
 * calibration record needs most.
 */

/** Identifies an uploaded source document within a single report run. */
export type SourceId = string & { readonly __brand: "SourceId" };

export type FileLocation = {
  /** Spreadsheet tab, when the source is a workbook. */
  sheet?: string;
  /** A1-style reference, or a range. */
  cell?: string;
  /** 1-indexed page, when the source is a document. */
  page?: number;
  /** 1-indexed line within the page. */
  line?: number;
};

export type Provenance =
  /** Read out of a file the user supplied. */
  | {
      type: "file";
      sourceId: SourceId;
      /** Original filename, kept for the audit trail. */
      filename: string;
      location: FileLocation;
      extractedBy: ModuleRef;
    }
  /** Taken from a versioned knowledge dataset. */
  | {
      type: "knowledge";
      dataset: string;
      /** Snapshot identifier, e.g. "2026-q3". Never a live lookup. */
      snapshot: string;
      key: string;
    }
  /** Supplied directly by the user, outside a file. */
  | { type: "user"; field: string }
  /** Computed from other evidence or claims. */
  | { type: "derived"; from: string[]; by: ModuleRef };

/** Which module produced something, and at which version. */
export type ModuleRef = {
  id: string;
  version: string;
};

/**
 * How completely a provenance record locates its value. Used by the
 * evidence-quality reasoner; it is deliberately not something a domain module
 * can assert about itself.
 */
export function provenanceSpecificity(p: Provenance): number {
  switch (p.type) {
    case "file": {
      const { sheet, cell, page, line } = p.location;
      if (cell || (page !== undefined && line !== undefined)) return 1;
      if (sheet || page !== undefined) return 0.6;
      return 0.3;
    }
    case "knowledge":
      return 0.8;
    case "user":
      return 0.5;
    case "derived":
      return 0.4;
  }
}
