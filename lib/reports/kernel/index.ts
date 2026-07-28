/**
 * The MarginGraph reasoning kernel.
 *
 * Domain-independent by construction. Nothing below knows what a business is,
 * what money is, or what any metric means — the reasoning engine receives a
 * ClaimSet and has no parameter through which a document could reach it.
 *
 * A new report type is: an Analyzer (domain logic) and a TemplateDefinition
 * (configuration). Nothing here changes.
 */

export { KERNEL_VERSION } from "./version";

export type {
  Provenance,
  ModuleRef,
  SourceId,
  FileLocation,
} from "./types/provenance";
export type { Quantity } from "./types/value";

export {
  createEvidence,
  deriveEvidence,
} from "./types/evidence";
export type {
  Evidence,
  EvidenceId,
  EvidenceKind,
} from "./types/evidence";

export { createAssumption } from "./types/assumption";
export type {
  Assumption,
  AssumptionId,
  AssumptionImpact,
  AssumptionOrigin,
} from "./types/assumption";

export { createClaim } from "./types/claim";
export type { Claim, ClaimId } from "./types/claim";

export { indexClaims } from "./types/claim-set";
export type { ClaimSet, ClaimIndex } from "./types/claim-set";

export type {
  Assessment,
  ConfidenceAssessment,
  ConfidenceBand,
  Contradiction,
  Counterargument,
  EvidenceGrade,
  TraceabilityIssue,
} from "./types/assessment";

export { reason, reasonerRegistry } from "./reasoning/engine";
export type { Reasoner, ReasoningContext } from "./reasoning/reasoner";

export { createRegistry } from "./registry/registry";
export type { Registry, Versioned } from "./registry/registry";

export type {
  Analyzer,
  AnalysisInput,
  ChapterDefinition,
  Extractor,
  KnowledgeSource,
  LanguageModel,
  LanguageModelRequest,
  LanguageModelResponse,
  Renderer,
  SourceDocument,
  TemplateDefinition,
} from "./contracts";

export { createManifest, describeManifest } from "./manifest/manifest";
export type { ReportManifest, ModelCallRecord } from "./manifest/manifest";

export { compose } from "./pipeline/compose";
export { runPipeline } from "./pipeline/run";
export type { Report, ReportChapter, PresentedClaim } from "./types/report";
