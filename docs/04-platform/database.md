---
doc: database
status: stub
owner: TBD
last-reviewed: TBD
depends-on: [knowledge-graph, ontology]
---

# Database

> **Purpose.** How the graph is physically stored and queried. Storage serves the model in
> [Knowledge Graph](../02-graph/knowledge-graph.md) — never the other way around.
>
> **Bias.** Boring, well-understood technology. Add a specialised store only when a workload
> provably cannot be served by what we already run.

## 1. Workloads

Characterise before choosing anything.

| Workload | Shape | Volume | Latency need | Consistency need |
|---|---|---|---|---|
| Assertion writes | _TBD_ | _TBD_ | _TBD_ | _TBD_ |
| Entity lookup | _TBD_ | _TBD_ | _TBD_ | _TBD_ |
| Graph traversal | _TBD_ | _TBD_ | _TBD_ | _TBD_ |
| Search | _TBD_ | _TBD_ | _TBD_ | _TBD_ |
| Semantic / vector | _TBD_ | _TBD_ | _TBD_ | _TBD_ |
| Analytics & bulk export | _TBD_ | _TBD_ | _TBD_ | _TBD_ |

## 2. Storage decisions

One row per store, each justified by a workload above.

| Store | Technology | Serves | Why not the primary store | ADR |
|---|---|---|---|---|
| _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ |

## 3. Physical model

How entities, assertions, provenance and time are laid out. Whether the current-state view
is derived from an append-only assertion log or maintained in place.

_TBD_

## 4. Temporal storage

Implementation of business time and system time, and the cost of as-of queries.

_TBD_

## 5. Write path

Ingestion → staging → validation → commit → derived views/indexes. Transaction boundaries,
idempotency keys, and how partial failures are handled.

_TBD_

## 6. Read path

Query patterns, index strategy, caching layers, and the boundary between live query and
precomputed view.

_TBD_

## 7. Migrations

Schema and ontology evolution against a live graph, backfill strategy, and how a bad
migration is reversed.

_TBD_

## 8. Backup, recovery and retention

RPO/RTO, restore drills, what is retained and for how long — including deleted and
superseded assertions.

_TBD_

## 9. Scaling plan

The next bottleneck at each order of magnitude, and the intended response. Partitioning and
sharding keys chosen now that are expensive to change later.

_TBD_

## 10. Environments and data handling

Production, staging, development. Rules for using real data outside production — see
[Security](security.md).

_TBD_

## Open questions

- [ ] Is a dedicated graph database required, or does a relational store with good indexing carry us to H2?
- [ ] What is the partition key we will regret choosing?
- [ ] Do we guarantee point-in-time reconstruction of the entire graph?
