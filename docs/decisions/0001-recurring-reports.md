---
adr: 0001
title: Which analyses we build, and in what order
status: superseded
date: 2026-07-28
deciders: [founder]
affects: [01-business, 03-intelligence, 04-platform]
supersedes: null
superseded-by: 0002
---

# ADR 0001 — Which analyses we build, and in what order

> **Superseded by ADR 0002, one hour later.** This ranked by how easily we
> could build each report rather than by whether the answer already exists in
> the customer's accounting package. Six of the seven do. Kept because the
> mistake is more instructive than the list.

## Context

The site sells one report: a business valuation. A valuation is bought once in
an owner's life. We have just decided on a subscription tier (€99/month,
unlimited), and a subscription needs analyses somebody runs *again*.

So the question is not "what else could we compute" but a narrower one: **what
is worth running regularly for an owner who has no CFO?**

We have evidence rather than a roadmap. Seven real files from three companies
and one property were run through the product and by hand in a single session.
The questions actually asked were:

| Question | Natural cadence |
|---|---|
| What is this business worth | once, at an event |
| Run this stock off or dump it | quarterly |
| Could we have decided this a year ago | rarely |
| What is the status per category now | monthly |
| What can we ask for this property | once, at an event |
| What does each investor pay | once, at an event |

Only one of the six recurs. That is the gap this decision closes.

## What a missing CFO actually costs

Four things, and each one is a report:

1. **Nobody notices that two reports disagree.** In one workbook the same year
   had three different revenue totals, €13.606 apart, and a cumulative column
   mixed six months of actuals with a forecast. Neither had been spotted.
2. **Nobody separates selling from earning.** Ranked by revenue, a range looks
   fine; ranked by revenue per euro of stock, 32% of inventory was unsellable.
3. **Nobody watches the second derivative.** A category fell 8% then 36%, and
   the total only moved once the biggest line stopped covering it.
4. **There is no benchmark.** An owner cannot tell whether a 39,5% gross margin
   is good, because there is nothing to compare it with.

## Options considered

| Option | Pros | Cons | Cost to reverse |
|---|---|---|---|
| Deepen the valuation report | Already built; SEO already points at it | Bought once; cannot carry a subscription | Low |
| Build every analysis we sketched | Broad appeal | Nine shallow reports beat by one good one; no focus | High |
| Build the recurring set, ranked by universality × acts-this-week × data available | Fits the subscription; each one proven by a real question | Valuation stops being the centre of the product | Medium |

## Decision

**Build the recurring set. Valuation stays as the entry product and the search
hook, but it is no longer the centre.**

The ranking, and the test each one had to pass:

> A report earns a monthly slot only if the answer changes monthly **and**
> ends in a name and a number somebody acts on this week. A conclusion is not
> a deliverable; a work list is.

| # | Report | Cadence | Universal? | Ends in |
|---|---|---|---|---|
| 1 | Debtors and DSO | monthly | any business that invoices | a call list, per customer, with amounts |
| 2 | Cash runway and the profit-to-cash bridge | monthly | all | months left, and the three items moving it |
| 3 | Inventory health | monthly | goods businesses | articles to reorder, run off, or clear |
| 4 | Cost structure and break-even | quarterly | all | the revenue level at which you break even |
| 5 | Margin by product, customer or category | quarterly | all | a keep/kill list with euro amounts |
| 6 | Budget against actual | monthly | those who budget | where the forecast is systematically wrong |
| 7 | Valuation | at an event | all | a range, with what would change it |

**Debtors is first.** Not because it is the most valuable but because it is the
only one whose data is a single export from every accounting package, it is
already monthly by nature, and it proves the recurring model at the lowest
cost. Cash runway is worth more and needs more.

**Reconciliation is not on the list because it is not a report.** It runs under
every one of them, on every file, and it reports what does not tie. It is where
every real error in the evidence sample was found.

## Consequences

**The accounting connection moves to the front.** Every report above needs
monthly data, and an owner without a CFO does not produce monthly data. Without
a connection to Exact, Moneybird, e-Boekhouden or Twinfield, "monthly report"
means "monthly upload", and nobody uploads twelve times a year. This was ranked
sixth an hour before this ADR was written; it is now second, ahead of
everything except the reconciliation layer. **A subscription without a
connection is a subscription nobody renews.**

**Benchmarks need an external source, and it must be citable.** Telling an
owner their margin is 39,5% is arithmetic. Telling them it is 39,5% against a
sector median is the product. CBS StatLine is open and free and comes with a
provenance we can print, which is the only kind we will use.

**The evidence base for this decision is one person's three companies**, all in
consumer goods and recreation. Inventory ranks third on that basis and would
rank lower for a services business. We accept the bias and mark it: the first
paying customer outside that sample can move the ranking.

**What gets harder:** the valuation content cluster now points at a product
that is no longer the main one. The site's information architecture will have
to widen, and that is a cost we take on knowingly.

## Revisit when

- The first ten paying customers are in, and the report they run second tells
  us whether this ranking is right.
- Or when an accounting connection ships and upload volume becomes a
  measurable ceiling rather than an assumption.
