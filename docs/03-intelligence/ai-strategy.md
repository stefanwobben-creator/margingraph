---
doc: ai-strategy
status: stub
owner: TBD
last-reviewed: TBD
depends-on: [principles, knowledge-graph, business-model]
---

# AI Strategy

> **Purpose.** Where AI creates durable leverage for MarginGraph, where it must never be the
> final authority, and how our use of it compounds instead of commoditising.
>
> **Framing.** Models are rented and improve for everyone. The graph, the evaluation sets and
> the correction loop are ours. Strategy lives in the second list.

## 1. Where AI creates leverage

| Area | Job | Human alternative | Why AI wins |
|---|---|---|---|
| Extraction from unstructured sources | _TBD_ | _TBD_ | _TBD_ |
| Entity resolution & disambiguation | _TBD_ | _TBD_ | _TBD_ |
| Enrichment & classification | _TBD_ | _TBD_ | _TBD_ |
| Verification & contradiction detection | _TBD_ | _TBD_ | _TBD_ |
| Natural-language interface to the graph | _TBD_ | _TBD_ | _TBD_ |

## 2. Where AI is not allowed to decide

The boundary. Which outputs must be grounded in a source, which require human sign-off, and
what is never generated at all.

_TBD_

## 3. Grounding stance

Our position on generated content that is not traceable to a source in the graph. This is a
brand-defining choice for a knowledge company.

_TBD_

## 4. Build vs. buy

Frontier APIs, open-weight models, fine-tunes, small task-specific models, classical ML.
Default per job, and the conditions to move.

_TBD_

## 5. The data flywheel

How usage and correction produce proprietary training and evaluation data, and how that data
improves the system. Name each loop and its measurement.

_TBD_

## 6. Evaluation and ground truth

The gold sets, who curates them, and the accuracy bar per task. Without this, model changes
are gambling. Harness details in [LLM Architecture](llm-architecture.md).

_TBD_

## 7. Human-in-the-loop

Where humans sit in the pipeline, what they see, and how their decisions become training
signal rather than one-off fixes.

_TBD_

## 8. Cost strategy

Cost per extracted fact and per answered question, and the trajectory we need for the
[Business Model](../01-business/business-model.md) to work.

_TBD_

## 9. Risks

Hallucinated facts entering the graph, silent model regressions, provider concentration,
prompt injection from ingested sources, and reputational damage from confident errors.

_TBD_

## Open questions

- [ ] Is our defensibility the graph, the evals, or the correction loop?
- [ ] What accuracy level makes automated extraction publishable without review?
- [ ] Do we ever expose model-generated content that has no citation?
