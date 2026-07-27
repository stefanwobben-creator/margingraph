---
doc: ui
status: stub
owner: TBD
last-reviewed: TBD
depends-on: [product-strategy, api, seo]
---

# UI

> **Purpose.** How people see, navigate, trust and act on the graph. Interface principles and
> structure — not visual design specifications.
>
> **Standard.** A user should always be able to answer: where did this come from, when was it
> true, and how sure are you.

## 1. Surfaces

| Surface | Audience | Primary job | Rendering / indexability |
|---|---|---|---|
| Public entity pages | _TBD_ | _TBD_ | must be crawlable — see [SEO](../05-growth/seo.md) |
| Search & discovery | _TBD_ | _TBD_ | _TBD_ |
| Authenticated app | _TBD_ | _TBD_ | _TBD_ |
| Internal ops / review console | _TBD_ | _TBD_ | _TBD_ |

## 2. Information architecture

Global navigation, the entity page as the atomic unit, and how relationships are traversed
without the user getting lost.

_TBD_

## 3. Entity page anatomy

The canonical layout: identity block, key facts, relationships, timeline, sources, and
corrections. Every page in the product inherits from this.

_TBD_

## 4. Showing provenance and uncertainty

How source, confidence, freshness and disagreement are displayed without overwhelming the
page. Solved well, this is the product's signature.

_TBD_

## 5. Search experience

Entry point for most sessions. Query understanding, ranking, disambiguation between similarly
named entities, and zero-result handling.

_TBD_

## 6. AI interaction surfaces

Where conversational or generative interaction appears, how citations render, and how a user
verifies an AI answer against the graph.

_TBD_

## 7. Internal review console

The interface where humans adjudicate merges, verify extractions and correct errors. It is a
core product, not a side tool — throughput here caps graph quality.

_TBD_

## 8. Design system

Component library, tokens, and the rule for introducing new patterns.

_TBD_

## 9. Performance budget

Targets per surface. Public pages have the strictest budget because they carry acquisition.

_TBD_

## 10. Accessibility and internationalisation

Standard we hold ourselves to, language and locale strategy, and formatting of names, dates,
currencies and addresses across jurisdictions.

_TBD_

## Open questions

- [ ] Is the public page and the in-app page the same page with more unlocked, or two products?
- [ ] How do we visualise a graph without producing an unreadable hairball?
- [ ] How does a user report an error in three clicks or fewer?
