---
doc: report-platform-architecture
status: draft
owner: TBD
last-reviewed: 2026-07-28
depends-on: [knowledge-graph, ai-strategy, llm-architecture]
---

# Report platform architecture

The design for the engine that produces every MarginGraph report. Written
before the first one is built, because three of the decisions below cannot be
made later.

---

## 1. Where the codebase stands today

There is nothing to refactor.

| | |
|---|---|
| Application code | 3,971 lines across app, components and lib |
| Report generation | none |
| LLM integration | none |
| File handling | none |
| Runtime dependencies | 16, none of them AI or data related |

What exists is a publishing site: a content engine, 97 static pages, an SEO
layer. It is orthogonal to the platform — it shares a design system, a domain
and a deployment, and nothing else.

**So the answer to "does the current architecture fit the vision" is that the
question does not yet apply.** Nothing constrains the design. That is the most
valuable fact in this document, and it expires the moment the first report is
built.

---

## 2. The distinction the whole architecture rests on

"All intelligence in one engine" is the right instinct and the wrong boundary.
Drawn literally it produces one of two failures:

- a single engine containing fifty domain branches — a god object nobody can
  change safely, or
- domain logic pushed into templates, where the epistemics gets copied fifty
  times and drifts.

The correct boundary is not between *intelligent* and *dumb*. It is between
**domain reasoning** and **epistemic reasoning**.

| | Shared? | Examples |
|---|---|---|
| **Domain reasoning** | No — different per report | How to normalise EBITDA. How to compute runway. Which multiple band applies. |
| **Epistemic reasoning** | **Yes — one implementation** | Which assumptions does this rest on? Do any two findings contradict? How confident can we be? What would change the answer? |

The Reasoning Engine is not the thing that analyses. It is **the thing that
reasons about the quality of an analysis**. It never learns what EBITDA is.

That is not an arbitrary split. It is the same distinction the company's own
mission rests on: *justified confidence, not truth*. The engine owns the
justification. Domain modules own the calculation.

---

## 3. The second decision that cannot be reversed

**Deterministic core, language models at the edges.**

Every figure in a MarginGraph report has to trace back to a line in the
customer's file. A model that computes the number cannot provide that, cannot
reproduce it, and cannot be audited three years later when someone disputes a
valuation.

```
LLM              deterministic code                 LLM
─────────────    ──────────────────────────────     ─────────────
extraction   →   normalisation, analysis,       →   narration
                 reasoning, evaluation,
                 confidence
```

- **In:** a model turns a messy spreadsheet into typed facts. Its output is
  validated against a schema and every value keeps a pointer to its source
  cell.
- **Middle:** arithmetic, rules and epistemics. No model. Same inputs always
  produce the same findings.
- **Out:** a model turns findings into prose. It may not introduce a number
  that is not already in a finding — enforced by post-generation checking, not
  by asking it nicely.

Fifty templates × model-computed numbers is an unauditable product. This
boundary is why the platform can promise what the marketing already says.

---

## 4. The pipeline, corrected

The proposed pipeline has two ordering problems.

**Knowledge is not a stage.** Sector multiples, tax bands and benchmark data
are *consulted during* analysis and reasoning. Placing them after evaluation
means analysing without the data the analysis needs. Knowledge is a service.

**A stage is missing.** The Reasoning Engine has nothing to reason about until
domain analysis has produced findings. `Reasoning Engine → Evaluation` skips
the step where the actual calculation happens.

Corrected:

```
                        ┌──────────────────┐
                        │ Knowledge (svc)  │◀── versioned datasets
                        └────────┬─────────┘
                                 │ consulted by
   Input                         ▼
     │      ┌──────────┬──────────────┬───────────┬────────────┐
     ├─────▶│ Extract  │  Normalise   │  Analyse  │  Reason    │
     │      │ (LLM)    │  (code)      │  (code)   │  (code)    │
     │      └──────────┴──────────────┴───────────┴─────┬──────┘
     │        Facts        Facts+        Findings       │ Assumptions
     │        + provenance Assumptions                  │ Contradictions
     │                                                  │ Confidence
     │                                                  ▼
     │                              ┌──────────┬──────────────┐
     │                              │ Evaluate │  Compose     │
     │                              │ (code)   │  (code+LLM)  │
     │                              └──────────┴──────┬───────┘
     │                                Quality signals │ Report
     │                                                ▼
     │                              ┌──────────┬──────────────┐
     └─────────────────────────────▶│ Template │   Render     │
              config only           │ (config) │ HTML/PDF/JSON│
                                    └──────────┴──────────────┘
```

Every stage takes a typed input and returns a typed output, so each is testable
in isolation with fixtures and none of them knows what runs before or after.

---

## 5. The data model

This is the part that cannot be retrofitted. Provenance added in year three
covers nothing produced in years one and two, and those are exactly the years
the calibration record needs.

```ts
Provenance   where a value came from: file, sheet, cell | page, line |
             knowledge source + version | derived-from other values
Fact         an extracted value + Provenance. Never a conclusion.
Assumption   a stated belief + origin (user | template default | derived)
             + the findings that depend on it
Finding      a computed result + the Facts and Assumptions it consumed
Claim        a Finding, expressed for a reader, carrying a confidence band
Contradiction two Facts or Findings that cannot both hold, + why
Report       ordered Claims + the manifest that produced them
```

Three rules, enforced by types rather than convention:

1. **A Finding cannot be constructed without its inputs.** Not a lint rule — a
   constructor that requires them.
2. **A Claim cannot be constructed without a Finding.** Prose that traces to
   nothing cannot exist in the type system.
3. **Every number rendered comes from a Claim.** The renderer takes Claims, not
   strings.

Get these three right and the audit trail is free forever. Get them wrong and
no amount of later work recovers it.

---

## 6. Versioning and the audit manifest

To reproduce a report you need more than an engine version. Every report stores:

```ts
type ReportManifest = {
  reportId: string;
  generatedAt: string;

  engine: string;              // semver of the kernel
  template: { id: string; version: string };
  analyzers: Record<string, string>;    // domain module → version
  evaluations: Record<string, string>;  // evaluation module → version
  knowledge: Record<string, string>;    // dataset → snapshot version

  model: {                     // one entry per LLM call site
    provider: string;
    model: string;
    promptVersion: string;
  }[];

  inputDigest: string;         // hash of the normalised input
};
```

Two consequences worth stating plainly:

- **Store the normalised input, not just the raw file.** Re-running extraction
  with a newer model gives different facts, so a report is only reproducible
  from the normalised form.
- **Knowledge datasets are versioned snapshots, never live lookups.** A
  valuation that used the 2027 sector multiples must still say 2027 in 2031.

This manifest *is* the calibration record. It is the only asset in the company
that cannot be back-filled by a competitor with more money, because it can only
be produced by running the system in real time.

---

## 7. Folder structure

```
lib/reports/
├── kernel/                     domain-agnostic. Knows nothing about finance.
│   ├── types/
│   │   ├── provenance.ts
│   │   ├── fact.ts
│   │   ├── assumption.ts
│   │   ├── finding.ts
│   │   ├── claim.ts
│   │   └── report.ts
│   ├── pipeline/
│   │   ├── run.ts              orchestrates the stages
│   │   ├── stage.ts            the Stage interface
│   │   └── context.ts          what flows between stages
│   ├── reasoning/              THE engine — one implementation, forever
│   │   ├── assumptions.ts
│   │   ├── contradictions.ts
│   │   ├── uncertainty.ts
│   │   ├── sensitivity.ts      which assumption moves the answer most
│   │   ├── counterarguments.ts
│   │   └── confidence.ts
│   ├── evaluation/             quality signals over findings
│   │   ├── evidence-quality.ts
│   │   ├── assumption-quality.ts
│   │   ├── logical-consistency.ts
│   │   ├── bias.ts
│   │   └── registry.ts
│   ├── compose/
│   │   ├── composer.ts         Claims + template config → Report
│   │   └── narrate.ts          the only place an LLM writes prose
│   └── manifest/
│       ├── version.ts
│       └── audit.ts
│
├── domains/                    one folder per subject. Grows to ~15, not 50.
│   └── valuation/
│       ├── analyze.ts          Facts + Assumptions + Knowledge → Findings
│       ├── methods/            multiple.ts, dcf.ts, asset.ts
│       ├── normalize.ts        add-backs, owner compensation
│       ├── schema.ts           what this domain needs as input
│       └── version.ts
│
├── knowledge/                  versioned data, not code
│   ├── sector-multiples/2026-q3.ts
│   ├── discount-rates/2026-q3.ts
│   ├── source.ts               KnowledgeSource interface
│   └── registry.ts
│
├── templates/                  CONFIGURATION ONLY. No logic, ever.
│   └── business-valuation/
│       ├── template.ts         id, version, domain, audience, tone, chapters
│       ├── inputs.ts           required and optional inputs
│       ├── chapters.ts         which claims appear, in what order
│       └── branding.ts
│
├── io/
│   ├── extract/                xlsx.ts, csv.ts, pdf.ts → Facts
│   └── render/                 html.ts, pdf.ts, json.ts
│
└── llm/
    ├── provider.ts             the LanguageModel interface
    ├── prompts/                versioned, one file per call site
    └── guard.ts                rejects generated text containing numbers
                                that are not in a Claim
```

Two things this structure enforces by shape:

- `templates/` has no imports from `domains/` or `kernel/reasoning/`. A
  template that needs logic will fail review because it will need an import
  that is not allowed. This should be an ESLint boundary rule, not a
  convention.
- `kernel/` imports nothing from `domains/`. The dependency runs one way.

---

## 8. What needs an interface

Six, and only six. Everything else can be a plain function until it has a
second implementation.

| Interface | Why | Second implementation arrives |
|---|---|---|
| `Extractor` | file type → Facts | the day after XLSX: PDF |
| `Analyzer` | the domain contract | report #2 |
| `EvaluationModule` | pluggable quality signals | report #2 |
| `KnowledgeSource` | static now, API later | when data goes live |
| `Renderer` | HTML now, PDF and JSON later | first enterprise request |
| `LanguageModel` | provider independence | first price or quality change |

Each is a registry lookup, not a switch statement:

```ts
registerAnalyzer("valuation", valuationAnalyzer);
registerTemplate(businessValuationTemplate);
```

A new report registers itself. Nothing central changes. That is what makes
"new template = configuration" true rather than aspirational.

---

## 9. What must stay simple until after the MVP

Deliberately not built. Each of these is cheap to add later and expensive to
maintain now.

| | Why it can wait |
|---|---|
| Queue and workers | Synchronous generation is fine below a few hundred reports a day. Add a queue when a report takes longer than a request. |
| Multi-tenancy abstraction | One tenant model until the second customer type exists. |
| Caching | Reports are one-off by nature. There is nothing to cache yet. |
| Plugin loading | Static registration in code. Dynamic loading solves a problem nobody has. |
| Second LLM provider | One provider behind the interface. The interface is the insurance; a second implementation is not needed to have it. |
| PDF | HTML first. PDF is a renderer, and the interface already anticipates it. |
| Knowledge as a database | Typed TypeScript constants, versioned by filename. A database adds operations for data that changes quarterly. |
| A/B testing prompts | Version them, ship one. |
| Streaming output | A report is not a chat. |

## 10. What must be right on day one

Five things, because none of them can be retrofitted.

1. **Provenance on every value.** Adding it later covers nothing already
   produced.
2. **The manifest.** You cannot recover which engine version produced a 2027
   report if you did not record it in 2027.
3. **The deterministic boundary.** Moving computation out of a model later
   means rewriting every analyzer.
4. **Templates as configuration.** If reports one through three contain logic,
   reports four through fifty will copy them. The pattern is set by the first
   one.
5. **The kernel knowing no finance.** One domain import into `kernel/` and the
   boundary is gone, quietly, forever.

---

## 11. The technical debt of proceeding without this

There is none in what exists. The debt comes from how the first report will
naturally be built if this document does not exist.

The default path is: build the valuation report as one well-written module,
because that is the fastest way to a paying customer. It works. Report two
copies it, because copying is faster than extracting. By report six there are
six implementations of confidence scoring, and they disagree.

The cost is not the duplication. It is that **the audit trail stops being
consistent between reports** — the confidence in a valuation means something
different from the confidence in a runway report. At that point the one thing
that differentiates MarginGraph from a prompt is gone, and it goes without
anyone noticing.

Concretely, if reports one to five are built ad hoc:

| Debt | Cost of fixing at report 6 |
|---|---|
| Duplicated epistemics | 2–3 weeks, plus every report's output changes |
| Provenance missing | not recoverable for reports already sold |
| No manifest | not recoverable at all |
| Templates containing logic | rewrite of every template |
| LLM-computed figures | rewrite of every analyzer, and re-issue of sold reports |

Rows three and five are the ones that matter. The rest is work; those two are
losses.

---

## 12. Sequencing, and one disagreement

The design above supports fifty templates. Building for fifty before one has
been sold is a different risk, and it is worth naming once.

The kernel is justified by report two, not report fifty. My recommendation:

1. **Build the kernel and one domain and one template together**, treating the
   valuation report as the forcing function. The kernel exists so that report
   two is cheap — it does not need to anticipate report fifty.
2. **Build report two (cash runway) immediately after**, before selling
   anything. Two reports is what proves the boundary holds. One report always
   fits its own engine.
3. **Then sell.** Not before, because the first paying customer changes what
   you are allowed to break.

Fifty templates is a destination, not a starting specification. The
architecture above is designed so that arriving there requires no rewrite —
which is a different and more achievable goal than building for it now.
