---
doc: data-sources
status: stub
owner: TBD
last-reviewed: TBD
depends-on: [knowledge-graph, ontology, principles]
---

# Data Sources

> **Purpose.** Where knowledge comes from, what we are legally and ethically allowed to do
> with it, how trustworthy it is, and how it enters the graph.
>
> **Rule.** No source enters production without a recorded licence position. Unclear
> provenance is a liability that surfaces years later, at exactly the wrong moment.

## 1. Source taxonomy

| Class | Examples | Trust | Cost | Licence risk |
|---|---|---|---|---|
| Official registries | _TBD_ | _TBD_ | _TBD_ | _TBD_ |
| Regulatory filings | _TBD_ | _TBD_ | _TBD_ | _TBD_ |
| Commercial data partners | _TBD_ | _TBD_ | _TBD_ | _TBD_ |
| Public web | _TBD_ | _TBD_ | _TBD_ | _TBD_ |
| Customer-contributed | _TBD_ | _TBD_ | _TBD_ | _TBD_ |
| Derived / inferred | _TBD_ | _TBD_ | _TBD_ | _TBD_ |

## 2. Source registry

The authoritative inventory. One row per source; each links to its own detail note when it
grows non-trivial.

| ID | Source | Coverage | Method | Refresh | Licence | Owner | Status |
|---|---|---|---|---|---|---|---|
| _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ |

## 3. Acquisition methods

Bulk download, API, crawl, partner feed, manual. Rules of conduct for crawling: robots,
rate limits, identification, and what we do not touch.

_TBD_

## 4. Licensing and legal position

Per class: what redistribution is permitted, whether derived data is encumbered, attribution
requirements, and how obligations flow through to the [API](../04-platform/api.md) and public
pages. Contamination risk — one restrictive source poisoning a derived dataset — is tracked here.

_TBD_

## 5. Trust ranking

How sources are ranked when they disagree, and how a source's rank changes when it is caught
being wrong.

_TBD_

## 6. Ingestion pipeline

Stages, idempotency, replay, dead-letter handling, and where a human intervenes.
Extraction agents are specified in
[Agent Architecture](../03-intelligence/agent-architecture.md).

_TBD_

## 7. Freshness and SLA

Per source: expected latency from real-world change to graph, and how staleness is detected
and surfaced to users.

_TBD_

## 8. Source health monitoring

Schema drift, silent truncation, volume anomalies. Sources fail quietly far more often than
they fail loudly.

_TBD_

## 9. Dependency risk

Concentration on any single source, and the mitigation if it closes, prices up, or blocks us.

_TBD_

## Open questions

- [ ] Which sources are strategically essential, and what is our position if one is withdrawn?
- [ ] Do customers contribute data back, and on what terms?
- [ ] Can we distinguish "we have no data" from "there is nothing to report" for every field?
