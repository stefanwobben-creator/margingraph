---
doc: llm-architecture
status: stub
owner: TBD
last-reviewed: TBD
depends-on: [ai-strategy, knowledge-graph]
---

# LLM Architecture

> **Purpose.** How language models are wired into the system: routing, context, output
> contracts, grounding, evaluation and cost control.
>
> **Not here.** Which jobs are worth doing with AI (→ [AI Strategy](ai-strategy.md));
> multi-step autonomy (→ [Agent Architecture](agent-architecture.md)).

## 1. Provider abstraction

The interface between our code and any model provider, and how deep the abstraction goes.
Over-abstracting costs capability; under-abstracting costs freedom.

_TBD_

## 2. Model routing

| Task | Model tier | Latency budget | Cost budget | Fallback |
|---|---|---|---|---|
| _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ |

## 3. Prompt and context architecture

Where prompts live, how they are versioned and reviewed, and how context is assembled.
Prompts are production artefacts and are treated like code.

_TBD_

## 4. Structured output contracts

Schemas for every model call that writes to the graph. Validation, repair, and what happens
when validation keeps failing.

_TBD_

## 5. Retrieval over the graph

How graph structure is turned into model context — traversal, subgraph selection, ranking,
and the mix of text, vector and structured retrieval.

_TBD_

## 6. Grounding and citation

Every user-facing claim carries its source. How citations are produced, verified, and
rendered in the [UI](../04-platform/ui.md).

_TBD_

## 7. Evaluation harness

Datasets, metrics, regression gating in CI, and the rule for promoting a prompt or model
change to production.

_TBD_

## 8. Guardrails

Prompt-injection defence for untrusted ingested content, output filtering, PII handling,
refusal behaviour, and rate/abuse limits.

_TBD_

## 9. Caching and cost control

What is cacheable, cache keys and invalidation, batching, and per-tenant budget enforcement.

_TBD_

## 10. Observability

Trace of every call: inputs, outputs, cost, latency, model version, evaluation outcome.
Retention policy for these traces.

_TBD_

## Open questions

- [ ] Is retrieval graph-first with text as support, or the reverse?
- [ ] What is the fallback when the primary provider is down or deprecates a model?
- [ ] How do we prevent a model change from silently degrading extraction quality?
