import type { Analyzer, KnowledgeSource, TemplateDefinition } from "../contracts";
import { createManifest, type ModelCallRecord } from "../manifest/manifest";
import { compose } from "./compose";
import { reason, reasonerRegistry } from "../reasoning/engine";
import type { Assumption } from "../types/assumption";
import type { ClaimSet } from "../types/claim-set";
import type { Evidence } from "../types/evidence";
import type { Report } from "../types/report";

/**
 * The pipeline, from extracted evidence to a composed report.
 *
 * Extraction sits outside deliberately: it is the one stage that touches raw
 * files and language models, and keeping it out means this function is pure
 * and synchronous apart from the analyzer's own promise. Everything here is
 * reproducible from the same inputs.
 *
 * Note the shape of the stages: analysis produces claims, the engine reasons
 * about them, composition arranges them. The engine is handed a ClaimSet and
 * has no parameter through which a document could reach it.
 */
export async function runPipeline(input: {
  reportId: string;
  generatedAt: string;
  template: TemplateDefinition;
  analyzer: Analyzer;
  knowledge: KnowledgeSource;
  evidence: Evidence[];
  assumptions: Assumption[];
  inputDigest: string;
  extractors?: Record<string, string>;
  models?: ModelCallRecord[];
}): Promise<Report> {
  if (input.analyzer.domain !== input.template.domain) {
    throw new Error(
      `Template "${input.template.id}" expects domain "${input.template.domain}" ` +
        `but analyzer "${input.analyzer.id}" produces "${input.analyzer.domain}".`,
    );
  }

  const analysis = await input.analyzer.analyze({
    evidence: input.evidence,
    assumptions: input.assumptions,
    knowledge: input.knowledge,
  });

  const claimSet: ClaimSet = {
    claims: analysis.claims,
    evidence: [...input.evidence, ...(analysis.evidence ?? [])],
    assumptions: [...input.assumptions, ...(analysis.assumptions ?? [])],
  };

  const assessment = reason(claimSet);

  const manifest = createManifest({
    reportId: input.reportId,
    generatedAt: input.generatedAt,
    template: { id: input.template.id, version: input.template.version },
    analyzer: { id: input.analyzer.id, version: input.analyzer.version },
    extractors: input.extractors,
    reasoners: reasonerRegistry.versions(),
    knowledge: { [input.knowledge.id]: input.knowledge.snapshot },
    models: input.models,
    inputDigest: input.inputDigest,
  });

  return compose({
    reportId: input.reportId,
    template: input.template,
    claimSet,
    assessment,
    manifest,
  });
}
