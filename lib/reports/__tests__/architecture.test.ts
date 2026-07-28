import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { businessValuationTemplate } from "@/lib/reports/templates/business-valuation";

/**
 * The architecture, checked rather than agreed.
 *
 * The kernel README states what a new report is allowed to cost. ESLint
 * already enforces the import boundaries; these tests cover the promises that
 * no import rule can see, because they are about what a file contains rather
 * than what it imports.
 *
 * The point of writing them down here is that the next report type is added by
 * someone who has not read the README.
 */

const ROOT = process.cwd();

function filesUnder(dir: string): string[] {
  const out: string[] = [];
  const walk = (current: string) => {
    for (const entry of readdirSync(current)) {
      const full = join(current, entry);
      if (statSync(full).isDirectory()) walk(full);
      else if (full.endsWith(".ts") || full.endsWith(".tsx")) out.push(full);
    }
  };
  walk(dir);
  return out;
}

/**
 * Comments are where the boundary gets explained, and explaining it needs
 * examples: the contracts file says an analyzer "knows what EBITDA is" in
 * order to say that the kernel does not. Scanning comments would flag exactly
 * the prose that documents the rule, so the sweep looks at code only.
 */
function code(file: string): string {
  return readFileSync(file, "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

describe("the kernel stays domain-independent", () => {
  const kernelFiles = filesUnder(join(ROOT, "lib", "reports", "kernel"));

  // The import rules are ESLint's job. This is the other half: the kernel can
  // stay import-clean and still learn what a business is, one identifier at a
  // time, through a field name or a special case for a metric it recognises.
  it("contains no domain vocabulary in its code", () => {
    const forbidden = /\b(ebitda|valuation|revenue|multiple|discountRate|balanceSheet)\b/i;
    const offenders = kernelFiles.filter(
      (file) => !file.includes("__tests__") && forbidden.test(code(file)),
    );
    expect(offenders.map((f) => f.replace(ROOT, ""))).toEqual([]);
  });
});

describe("a template is configuration", () => {
  it("holds no behaviour", () => {
    const walk = (value: unknown, path: string): string[] => {
      if (typeof value === "function") return [path];
      if (Array.isArray(value)) {
        return value.flatMap((item, index) => walk(item, `${path}[${index}]`));
      }
      if (value && typeof value === "object") {
        return Object.entries(value).flatMap(([key, item]) =>
          walk(item, `${path}.${key}`),
        );
      }
      return [];
    };
    expect(walk(businessValuationTemplate, "template")).toEqual([]);
  });

  it("declares the domain it expects, so a mismatch fails loudly", () => {
    expect(businessValuationTemplate.domain).toBe("valuation");
    expect(businessValuationTemplate.version).toMatch(/^\d+\.\d+\.\d+$/);
  });
});

describe("the domain layer grades nothing about itself", () => {
  const domainFiles = filesUnder(join(ROOT, "lib", "reports", "domains"));

  // An analyzer that scores its own confidence scores it generously, and the
  // score stops meaning the same thing across two reports. That is the one
  // rule in the README that no import boundary can enforce.
  it("never sets a confidence, a band or a score", () => {
    const forbidden = /\b(confidenceBand|band:\s*["']|score:\s*[\d.])/;
    const offenders = domainFiles.filter(
      (file) => !file.includes("__tests__") && forbidden.test(readFileSync(file, "utf8")),
    );
    expect(offenders.map((f) => f.replace(ROOT, ""))).toEqual([]);
  });
});

describe("knowledge is a snapshot, never a lookup", () => {
  const knowledgeFiles = filesUnder(join(ROOT, "lib", "reports", "knowledge"));

  it("makes no network call", () => {
    const forbidden = /\b(fetch|axios|XMLHttpRequest|https?:\/\/[^\s"')]+\/api)/;
    const offenders = knowledgeFiles.filter((file) =>
      forbidden.test(readFileSync(file, "utf8")),
    );
    expect(offenders.map((f) => f.replace(ROOT, ""))).toEqual([]);
  });

  it("pins a snapshot identifier", () => {
    for (const file of knowledgeFiles) {
      expect(readFileSync(file, "utf8"), file).toMatch(/snapshot/i);
    }
  });
});
