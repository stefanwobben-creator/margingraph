# Content plan — Business Valuation cluster

The first topical cluster. Everything MarginGraph publishes about what a
business is worth lives here, links inward to one commercial page, and never
duplicates another page's search intent.

## Shape

```
                    /decision/business-valuation          ← the money page
                     ▲            ▲             ▲
        ┌────────────┘            │             └────────────┐
   12 blog articles          50 FAQ pages              /faq index
   (understand)              (answer one question)     (hub)
        ▲                         │
        └─────────────────────────┘
        every FAQ links to ≥2 blogs; every blog links to the decision
```

**Decision page** — commercial intent. "I want this done."
**Blog** — comprehension intent. "I want to understand this."
**FAQ** — answer intent. "I want one fact, now." Written for the featured
snippet and for AI assistants that quote a single paragraph.

No page targets the same query as another. Where two came close, the intent was
split rather than the page dropped — see *Cannibalisation* below.

## 1 decision page

`/decision/business-valuation` — *What is my business worth?*
The hub. Links out to every blog in the cluster and to the FAQ index.

## 12 blog articles

Two already existed. Ten are new, per the brief.

| Slug | Angle | Primary intent |
|---|---|---|
| `how-to-value-a-business` | Pillar. The whole process end to end. | "how to value a business" |
| `ebitda-multiple-explained` | What determines the multiple itself | "ebitda multiple" |
| `revenue-multiple-explained` | When turnover is the right base | "revenue multiple" |
| `dcf-valuation-explained` | Discounting, in plain language | "dcf valuation" |
| `sde-vs-ebitda` | Which earnings figure applies to you | "sde vs ebitda" |
| `common-valuation-mistakes` | Nine errors, with what each costs | "valuation mistakes" |
| `what-buyers-look-for` | The buyer's side of the table | "what buyers look for" |
| `how-recurring-revenue-affects-valuation` | Why contracts move the multiple | "recurring revenue valuation" |
| `how-profitability-affects-valuation` | Margin as the lever | "profitability valuation" |
| `preparing-your-business-for-sale` | The 12-month runway | "prepare business for sale" |
| `how-ebitda-affects-your-valuation` *(existing)* | Normalisation and add-backs | "adjusted ebitda" |
| `revenue-multiple-or-ebitda-multiple` *(existing)* | Choosing between the two | "revenue or ebitda multiple" |

### Cannibalisation, resolved

Two pairs would otherwise have competed for the same result:

- **`ebitda-multiple-explained`** covers *what sets the multiple* (size, growth,
  concentration, sector). The existing **`how-ebitda-affects-your-valuation`**
  covers *what goes into EBITDA* (add-backs, normalisation). Different question,
  different page.
- **`revenue-multiple-explained`** covers *how a revenue multiple works*. The
  existing **`revenue-multiple-or-ebitda-multiple`** covers *which of the two to
  use*. Comparison intent is its own query.

## 50 FAQ pages

One question per page at `/faq/{slug}`. Each carries an SEO title, meta
description, an H1 that is the question verbatim, a short answer written to be
quoted whole, a longer answer, and links to the decision page plus at least two
blogs.

| Group | Count | Covers |
|---|---|---|
| A — The basic number | 8 | what it's worth, who does it, what it costs |
| B — Multiples | 8 | ranges, drivers, industry, size |
| C — Earnings definitions | 7 | EBITDA, SDE, adjustments, add-backs |
| D — Methods | 7 | DCF, asset-based, why answers differ |
| E — What moves the number | 8 | recurring revenue, concentration, owner dependence, debt |
| F — Selling | 7 | preparation, timing, brokers, due diligence, earn-outs |
| G — Practical and Dutch | 5 | documents, messy books, box 2 tax, formal valuations |

## Linking rules

1. Every FAQ links to `/decision/business-valuation` in the short answer area
   and to **at least two** blogs in the body.
2. Every blog ends with a CTA to the decision page and lists three siblings in
   `related`.
3. The decision page lists the pillar and the four most-read blogs.
4. Nothing links out of the cluster except where the reader genuinely needs it.

Tags do the cross-linking automatically: `valuation`, `EBITDA`, `multiples`,
`exit`, `DCF`, `SDE`, `recurring revenue`, `due diligence`.

## Writing standard

- A number in the first two sentences wherever one exists.
- Name what is uncertain. A page that hedges everything is worthless; a page
  that hedges nothing is dishonest.
- No sentence that would survive being copied to a competitor's site.
- Dutch specifics stay in group G. The rest is jurisdiction-neutral.
