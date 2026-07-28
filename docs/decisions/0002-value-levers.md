---
adr: 0002
title: One engine, not seven reports — value and its levers
status: accepted
date: 2026-07-28
deciders: [founder]
affects: [01-business, 03-intelligence, 04-platform]
supersedes: 0001
superseded-by: null
---

# ADR 0002 — One engine, not seven reports

## Context

ADR 0001, accepted an hour earlier, ranked seven recurring reports and put
debtor aging first. It was wrong, and the way it was wrong is worth recording
because it is a repeatable mistake.

**It ranked by how easily we could build it, not by whether the answer already
exists.** Debtor aging is a button in Exact, Moneybird and e-Boekhouden. So is
a cash position, so is budget-against-actual. Building them means building a
worse copy of something the customer already has, for free, in software they
already pay for.

The distinction that matters is not lagging against leading. Today's most
valuable analysis was entirely backward-looking: an inventory work list of 103
articles and €388.782. It landed because **nobody computes it**, not because
it looks forward.

> The test is: does the answer already exist somewhere the owner can see it?
> If it is a button in their accounting package, we do not build it.

## What the owner cannot get anywhere

Three things, and they are the same thing seen from three sides:

1. **Where can I raise margin.** Needs price, cost, volume and mix combined.
   No accounting package does this; it is what the guides on contribution
   margin and cost to serve already describe by hand.
2. **How do I compare.** Needs an external, citable source. High perceived
   value, because behind most owner anxiety sits the question "am I normal".
3. **What if.** Raise prices 8%. Lose the biggest customer. Hire someone.
   Clear the dead stock. This is the forward-looking one, and it is the single
   thing a CFO does that nobody without one gets.

And the fourth, which ADR 0001 was about to demote: **what is it worth.** Every
owner has asked themselves this. It has universal pull and no cheap answer.

## The insight that unifies them

These are not four products. Value is the unit that all four are denominated
in.

Today, on real figures, one line did more work than any report:

> €10.000 of EBITDA is worth €103.700 of enterprise value at this multiple.

That converts every operational decision into the only currency an owner
already cares about. Clearing €388.782 of dead stock is a balance-sheet event
*and* a value event. One point of gross margin is a value event. A sector gap
is a value event with a size.

The kernel is already built for this and we have been using half of it. It
records assumptions with a declared impact, ranks counterarguments by leverage,
and carries alternatives on every assumption. That machinery exists to answer
"what would change this", and we have been pointing it backwards at a single
historical number.

The name says it. Margin, graphed. We built a valuation calculator.

## Options considered

| Option | Pros | Cons | Cost to reverse |
|---|---|---|---|
| Seven recurring reports (ADR 0001) | Fits a subscription; data is easy | Six of seven already exist in the customer's accounting package | Low, and taken now |
| Valuation only, deepened | Focused; matches existing SEO | Bought once; cannot carry a subscription | Medium |
| One engine: value, its drivers, and what each lever is worth | Nothing else does it; recurring by nature; uses the kernel as designed | Rests on assumptions, which is where an automated tool is least trusted | High |

## Decision

**One engine. Every report answers the same three questions, at a different
level of zoom:**

1. What is it worth now, as a range, with what each method rests on.
2. Which drivers carry that value, ranked by how much of the answer rests on
   each.
3. What each lever is worth, in euros of value, and where you sit against your
   sector.

**The admission test for any new analysis: does it end in a euro amount of
enterprise value?** Debtor aging does not, and is out. Inventory health does —
dead stock hits net assets and working capital directly — and is in.

Recurrence comes from movement, not from cadence. You run it again when you
have pulled a lever, and the record shows the line move. That is the
subscription, and it is also the reason to stay.

## Consequences

**The trust problem moves to the centre.** A debtor list cannot be wrong. "An
8% price rise is worth €340.000" can be very wrong. We are choosing the harder
product on purpose, and the kernel's confidence and counterargument machinery
stops being a nice property and becomes the load-bearing wall. Every lever
figure ships with the assumption it rests on and what happens if that
assumption is false, or it does not ship.

**Benchmarking is the weakest of the three and needs a spike before it is
promised.** CBS StatLine is open and citable but coarse; a defensible figure
for gross margin in Dutch home-decor wholesale is harder to obtain than it
sounds. Nothing about benchmarking goes on the site until we know what grain
of data actually exists.

**Valuation stays central**, which means the existing content cluster and the
€9 entry product keep pointing at the right place. That is a cost avoided
rather than a benefit, but ADR 0001 would have thrown it away.

**We accept that this is slower.** A debtor report is a week. A lever engine
with defensible sensitivity is longer, and it cannot be half-built without
being wrong.

## The mistake to remember

Two decisions in one day were ranked by the wrong axis: once by ease of build,
once by breadth of data. Both times the right axis was "does this already
exist for free". Write that down before ranking anything again.

## Revisit when

- The benchmarking spike returns, and the data either supports a sector
  comparison or does not.
- Or when a paying customer runs the engine a second time. If nobody re-runs
  it after pulling a lever, the recurrence thesis is wrong and the subscription
  goes with it.
