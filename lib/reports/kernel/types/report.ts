import type {
  Assessment,
  ConfidenceAssessment,
} from "./assessment";
import type { Claim } from "./claim";
import type { ClaimSet } from "./claim-set";
import type { ReportManifest } from "../manifest/manifest";

/** A claim as it appears in a report: the claim plus what the engine said about it. */
export type PresentedClaim = {
  claim: Claim;
  confidence: ConfidenceAssessment;
};

export type ReportChapter = {
  id: string;
  title: string;
  claims: PresentedClaim[];
  /** Set when the chapter matched no claims. */
  emptyText?: string;
};

/**
 * The composed report.
 *
 * Structure only — no prose, no formatting, no HTML. A renderer turns this
 * into something a person reads; the narration step turns claims into
 * sentences. Both are downstream of this type, which means the same report can
 * be re-rendered in a new format years later without re-running anything.
 */
export type Report = {
  id: string;
  title: string;
  chapters: ReportChapter[];
  /** Everything the engine established, carried whole. */
  assessment: Assessment;
  /** The inputs, kept so the report can be reproduced. */
  claimSet: ClaimSet;
  manifest: ReportManifest;
};
