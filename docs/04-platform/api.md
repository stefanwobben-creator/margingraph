---
doc: api
status: stub
owner: TBD
last-reviewed: TBD
depends-on: [ontology, database, business-model]
---

# API

> **Purpose.** The programmatic contract with the outside world. For an infrastructure
> company the API is the product; its stability is a promise measured in years.
>
> **Rule.** Published means permanent until formally deprecated. Design as if every field
> will be depended on by someone we never meet.

## 1. Audiences and surfaces

| Surface | Audience | Style | Stability guarantee |
|---|---|---|---|
| Public / free tier | _TBD_ | _TBD_ | _TBD_ |
| Customer API | _TBD_ | _TBD_ | _TBD_ |
| Bulk / feeds | _TBD_ | _TBD_ | _TBD_ |
| Internal | _TBD_ | _TBD_ | none |

## 2. Design principles

Resource shape, naming, predictability, and the trade-off between graph expressiveness and
API simplicity. Consistency beats cleverness.

_TBD_

## 3. Identifiers and URIs

The public entity identifier, its URI form, and its permanence guarantee. Shared with the
[UI](ui.md) and [SEO](../05-growth/seo.md) URL scheme — decide once.

_TBD_

## 4. Query model

How much graph traversal is exposed, how expensive queries are bounded, and how results are
paginated and ordered.

_TBD_

## 5. Provenance in responses

How source, confidence and as-of time are represented on every returned assertion. This is
a differentiator and should be first-class, not an optional expansion.

_TBD_

## 6. Authentication and authorisation

Key model, scopes, tenancy, and per-scope rate limits. Details in [Security](security.md).

_TBD_

## 7. Versioning and deprecation

Version scheme, what counts as breaking, notice period, and migration support.

_TBD_

## 8. Limits, quotas and metering

Rate limits, fair use, how usage is metered and how metering ties to billing in the
[Business Model](../01-business/business-model.md). Metering that customers cannot verify
themselves creates disputes.

_TBD_

## 9. Errors

Error taxonomy, format, and the rule that an error explains what to do next.

_TBD_

## 10. Change notification

Webhooks, change feeds, and how consumers learn that an entity they care about was corrected.

_TBD_

## 11. Developer experience

Documentation, SDKs, sandbox, example data, and time-to-first-successful-call as a tracked
metric.

_TBD_

## Open questions

- [ ] REST, GraphQL, or both — and who pays the complexity cost?
- [ ] Do free and paid tiers share one API with different limits, or are they separate products?
- [ ] How do downstream consumers reconcile when we retract a fact they cached?
