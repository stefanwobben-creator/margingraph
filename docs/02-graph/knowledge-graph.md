---
doc: knowledge-graph
status: stub
owner: TBD
last-reviewed: TBD
depends-on: [principles, mission]
---

# Knowledge Graph

> **Purpose.** The laws of the core asset: what a fact is, how it enters the graph, how it is
> trusted, corrected, versioned and retired. This document outranks any implementation.
>
> **Not here.** The specific types (→ [Ontology](ontology.md)), where data comes from
> (→ [Data Sources](data-sources.md)), how it is stored (→ [Database](../04-platform/database.md)).

## 1. What the graph is

In one paragraph, in plain language. What it contains and what it deliberately does not.

_TBD_

## 2. The atomic unit

Do we store facts, claims, or observations? A claim carries who said it, when, and how sure
we are — a fact does not. This choice determines whether we can ever be *provably* right.

_TBD_

## 3. Identity and entity resolution

The hardest problem in the system. How an entity gets an identity, how duplicates are
detected and merged, how merges are undone, and what identifiers are stable forever.

- Identifier scheme: _TBD_
- Resolution strategy: _TBD_
- Merge / split / unmerge semantics: _TBD_
- Human adjudication path: _TBD_

## 4. Provenance

Every assertion traces to a source, a method and a moment. What is recorded, and what is
exposed to users. Provenance is a product feature, not just an audit trail.

_TBD_

## 5. Confidence and conflict

How confidence is expressed, how contradicting sources are reconciled, and what we show when
we genuinely do not know.

_TBD_

## 6. Time

Business time vs. system time. How we answer "what did we believe on date X" and "what was
true on date X" — these are different questions and both matter.

_TBD_

## 7. Corrections and the right to be wrong

How errors are reported, verified and propagated, including to downstream API consumers and
cached surfaces. Subject correction rights link to [Security](../04-platform/security.md).

_TBD_

## 8. Quality model

Measurable dimensions: coverage, freshness, accuracy, completeness, consistency. How each is
sampled and reported. Quality that is not measured will regress.

_TBD_

## 9. Lifecycle

Discovery → extraction → resolution → enrichment → validation → publication → decay → retirement.
Each stage's owner and quality gate. Implementation in
[Agent Architecture](../03-intelligence/agent-architecture.md).

_TBD_

## 10. Scale targets

Entities, relations, assertions, write throughput and query latency at each horizon.
These numbers drive [Database](../04-platform/database.md).

_TBD_

## Open questions

- [ ] Is the graph append-only at the assertion layer, with a derived current-state view?
- [ ] What is our permanent public identifier, and can we guarantee it for ten years?
- [ ] Do we ever delete, or only supersede?
