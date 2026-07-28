import { KERNEL_VERSION } from "../version";

/**
 * Everything needed to reproduce a report.
 *
 * This is the only artefact in the platform that cannot be reconstructed
 * later. A competitor with more money can rebuild the content, the analysis
 * and the interface; nobody can recover which engine version produced a
 * report in 2027 if it was not recorded in 2027.
 */
export type ModelCallRecord = {
  /** Where in the pipeline the call happened, e.g. "extract:xlsx". */
  site: string;
  provider: string;
  model: string;
  promptId: string;
  promptVersion: string;
};

export type ReportManifest = {
  reportId: string;
  /** ISO timestamp. Supplied rather than read from the clock, so runs are reproducible. */
  generatedAt: string;

  engine: string;
  template: { id: string; version: string };
  analyzer: { id: string; version: string };
  extractors: Record<string, string>;
  reasoners: Record<string, string>;
  knowledge: Record<string, string>;
  models: ModelCallRecord[];

  /**
   * Hash of the normalised input, not of the uploaded file.
   *
   * Re-running extraction with a newer model produces different evidence from
   * the same file, so the file is not what makes a report reproducible — the
   * evidence is.
   */
  inputDigest: string;
};

export function createManifest(input: {
  reportId: string;
  generatedAt: string;
  template: { id: string; version: string };
  analyzer: { id: string; version: string };
  extractors?: Record<string, string>;
  reasoners: Record<string, string>;
  knowledge?: Record<string, string>;
  models?: ModelCallRecord[];
  inputDigest: string;
}): ReportManifest {
  return {
    reportId: input.reportId,
    generatedAt: input.generatedAt,
    engine: KERNEL_VERSION,
    template: input.template,
    analyzer: input.analyzer,
    extractors: input.extractors ?? {},
    reasoners: input.reasoners,
    knowledge: input.knowledge ?? {},
    models: input.models ?? [],
    inputDigest: input.inputDigest,
  };
}

/**
 * A short, stable description of what produced a report, for the audit line a
 * reader sees: "Engine v0.1.0 · Template v1.3".
 */
export function describeManifest(manifest: ReportManifest): string {
  return `Engine v${manifest.engine} · Template ${manifest.template.id} v${manifest.template.version} · Analyzer ${manifest.analyzer.id} v${manifest.analyzer.version}`;
}
