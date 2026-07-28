/**
 * The six contracts.
 *
 * Everything else in the platform can be a plain function until it has a
 * second implementation. These six will have one, and the cost of adding the
 * interface later is a rewrite of every caller.
 *
 * None of them are implemented in the kernel. The kernel defines the shape;
 * domain and IO layers fill it in.
 */
import type { Assessment } from "../types/assessment";
import type { Assumption } from "../types/assumption";
import type { Claim } from "../types/claim";
import type { ClaimSet } from "../types/claim-set";
import type { Evidence } from "../types/evidence";
import type { SourceId } from "../types/provenance";
import type { Report } from "../types/report";
import type { Versioned } from "../registry/registry";

/* -------------------------------------------------------------------------- */
/* Input                                                                       */
/* -------------------------------------------------------------------------- */

export type SourceDocument = {
  id: SourceId;
  filename: string;
  mimeType: string;
  bytes: Uint8Array;
};

/**
 * Turns one document into evidence. This is the only place a language model
 * touches input, and its output is validated before it goes anywhere.
 */
export type Extractor = Versioned & {
  accepts(document: SourceDocument): boolean;
  extract(document: SourceDocument): Promise<Evidence[]>;
};

/* -------------------------------------------------------------------------- */
/* Domain                                                                      */
/* -------------------------------------------------------------------------- */

export type AnalysisInput = {
  evidence: Evidence[];
  /** Assumptions supplied by the user or by the template. */
  assumptions: Assumption[];
  knowledge: KnowledgeSource;
};

/**
 * A domain module. Knows what EBITDA is; knows nothing about confidence.
 *
 * Returns claims and any evidence or assumptions it created along the way.
 * It must not compute a confidence score — that is the kernel's job, and an
 * analyzer scoring its own output is how the epistemics starts to drift
 * between reports.
 */
export type Analyzer = Versioned & {
  /** Domain key, e.g. "valuation". Opaque to the kernel. */
  domain: string;
  analyze(input: AnalysisInput): Promise<{
    claims: Claim[];
    evidence?: Evidence[];
    assumptions?: Assumption[];
  }>;
};

/* -------------------------------------------------------------------------- */
/* Knowledge                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Versioned reference data. Never a live lookup: a valuation that used the
 * 2027 sector multiples must still say 2027 when it is re-run in 2031.
 */
export type KnowledgeSource = Versioned & {
  /** Snapshot identifier recorded in the manifest, e.g. "2026-q3". */
  snapshot: string;
  lookup(dataset: string, key: string): Promise<Evidence | undefined>;
};

/* -------------------------------------------------------------------------- */
/* Output                                                                      */
/* -------------------------------------------------------------------------- */

export type Renderer = Versioned & {
  /** "html", "pdf", "json". */
  format: string;
  render(report: Report): Promise<Uint8Array | string>;
};

/* -------------------------------------------------------------------------- */
/* Language                                                                    */
/* -------------------------------------------------------------------------- */

export type LanguageModelRequest = {
  /** Registered prompt id; the text itself lives in the prompt registry. */
  promptId: string;
  promptVersion: string;
  input: Record<string, unknown>;
  /** JSON schema the response must satisfy. */
  schema?: unknown;
};

export type LanguageModelResponse = {
  text: string;
  model: string;
  /** Everything needed to reproduce the call, for the manifest. */
  usage?: { inputTokens?: number; outputTokens?: number };
};

export type LanguageModel = Versioned & {
  provider: string;
  complete(request: LanguageModelRequest): Promise<LanguageModelResponse>;
};

/* -------------------------------------------------------------------------- */
/* Template                                                                    */
/* -------------------------------------------------------------------------- */

export type ChapterDefinition = {
  id: string;
  title: string;
  /**
   * Which claims belong in this chapter. Selection is by tag or by metric —
   * both opaque strings — so a template never needs to know how a claim was
   * produced.
   */
  select: { tags?: string[]; metrics?: string[] };
  /** Shown when no claim matches, instead of an empty chapter. */
  emptyText?: string;
};

/**
 * A report template. Configuration only.
 *
 * There is deliberately no place in this type to put a function. A template
 * that needs behaviour has to change this interface, which is a visible
 * decision rather than a quiet one.
 */
export type TemplateDefinition = Versioned & {
  /** Which analyzer produces the claims. */
  domain: string;
  title: string;
  audience: string;
  tone: string;
  requiredInputs: string[];
  optionalInputs?: string[];
  chapters: ChapterDefinition[];
  /** Minimum confidence band a claim needs to appear at all. */
  minimumBand?: "high" | "moderate" | "low";
};

/* -------------------------------------------------------------------------- */

export type { Assessment, ClaimSet, Report };
