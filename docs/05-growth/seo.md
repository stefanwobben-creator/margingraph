---
doc: seo
status: stub
owner: TBD
last-reviewed: TBD
depends-on: [knowledge-graph, ui, business-model]
---

# SEO

> **Purpose.** Organic discovery as a compounding distribution asset. For a knowledge graph,
> SEO is not a marketing channel bolted on afterwards — the graph *is* the content, and its
> structure determines whether that content can be found at all.
>
> **Not here.** Paid acquisition, sales, partnerships.

## 1. Strategic role

Why organic discovery matters to this business specifically, and what share of acquisition it
is expected to carry at each horizon.

_TBD_

## 2. Page inventory

Which graph objects become public pages, and the intent each page serves. Pages that serve no
intent should not exist — scale without usefulness is a liability.

| Page type | Generated from | Search intent | Est. volume |
|---|---|---|---|
| _TBD_ | _TBD_ | _TBD_ | _TBD_ |

## 3. URL and identifier scheme

Permanent, human-readable, stable across renames and merges. Must agree with the entity URI
in the [API](../04-platform/api.md). Redirect policy for merged and renamed entities.

_TBD_

## 4. Quality threshold

The minimum data a page must contain to be published and indexable. Thin, near-duplicate
pages at scale are the single largest risk in this strategy.

_TBD_

## 5. Structured data

Schema.org mapping from the [Ontology](../02-graph/ontology.md), and the rule that markup
never asserts anything the page does not show.

_TBD_

## 6. Internal linking

The graph is a link graph. How relationships become navigation that distributes authority and
helps both users and crawlers reach depth.

_TBD_

## 7. Crawl and indexation management

Sitemaps, crawl budget across a large page inventory, canonicalisation, pagination, faceted
navigation, and which pages are deliberately kept out of the index.

_TBD_

## 8. Technical performance

Rendering strategy, Core Web Vitals targets, and freshness signals when an entity changes.
Constrains [UI](../04-platform/ui.md) rendering choices.

_TBD_

## 9. AI search and answer engines

Being cited by AI assistants and answer engines is becoming a distinct channel with distinct
requirements. Our position on machine access, licensing and attribution — coordinate with
[Data Sources](../02-graph/data-sources.md) licence obligations and
[Security](../04-platform/security.md) scraping policy.

_TBD_

## 10. Measurement

Indexation rate, coverage, ranking distribution, entity-page conversion to signup, and the
share of pages receiving any traffic at all.

_TBD_

## 11. Risks

Algorithm dependency, mass-generated-content penalties, duplication of source registries,
and takedown requests from entity subjects.

_TBD_

## Open questions

- [ ] What must a public page show for free, and where does the wall sit?
- [ ] Do we accept being scraped by AI crawlers in exchange for citation?
- [ ] How do we avoid publishing millions of pages that nobody ever needs?
