---
adr: 0003
title: A deterministic gate in front of everything
status: accepted
date: 2026-07-28
deciders: [founder]
affects: [01-business, 03-intelligence, 04-platform]
supersedes: null
superseded-by: null
---

# ADR 0003: A deterministic gate in front of everything

## Context

ADR 0002 decided one engine, denominated in value. It said nothing about what
happens when the file we are handed cannot be read, or is read wrongly.

Three things converged on the same answer in one afternoon.

**The product is not a valuation tool.** Described back to us by the tester, it
is "a website where I upload something, pay nine euros, and get a report back
that always earns me more". That is a better description than anything on the
site, and it changes the intake from a form into a drop zone.

**"Always" is a promise, and a promise needs a mechanism.** Some uploads
contain nothing. An engine obliged to find something will find something, so
"we found nothing" has to be a shippable outcome. It is shippable only if the
customer can decline to pay, and the decision to refund has to sit with them,
not with us, or we have built the exact incentive that corrupts the engine.

**Half of "we found nothing" is really "we could not read it".** Those two must
be told apart before money moves, and telling them apart cannot itself be a
judgement call, or the same failure mode reappears one level up.

## The insight

The reading test is the arithmetic.

Not "am I confident I understood this file", which is a score, invites a
threshold, and gets tuned. Instead: **does my reading reproduce the document's
own subtotals.** If it does, the reading is right. If it does not, either the
reading is wrong or the document is, and in both cases nothing may run.

That is binary, computable, and it catches the misinterpretation that looks
convincing, which is the only kind that matters.

It was found by hand. A management report arrived with two versions of the same
2026 budget in one workbook, €147.200 apart on gross margin after freight. The
difference was found by adding up the rows, not by knowing anything about the
business.

## Decision

**A deterministic gate runs before the kernel and before payment.** No model in
the path. `lib/reports/gate`, with the same kind of lint boundary the kernel
has, extended to forbid importing the kernel too: the gate runs first, so it
cannot depend on what comes after it.

Four layers, in descending hardness:

```
0  mechanics     opens, has a text layer, not password protected, not a scan
1  structure     numeric cells, recognisable row labels, currency tokens
2  arithmetic    every subtotal is the sum of its parts
3  cross-document  the balance sheet agrees with the P&L; two tabs agree
```

Three outcomes, as a state and never a score:

```
green   the reading reproduces the totals            run everything
amber   one figure does not follow from its parts    name it and ask
red     nothing testable                             say why, charge nothing
```

**Amber is not a failure state.** It is usually the first finding and often the
largest, because a subtotal that does not reconcile is a number someone has
been steering by. It is also the intake-with-correction the tester asked for,
now in the right place: one question about one cell, asked when something is
actually wrong, instead of a form that assumes the user knows what to fill in.

### Three properties that make it a gate rather than a check

**Tolerance is derived, not configured.** A figure at precision `p` hides at
most `p/2`, so a subtotal of `n` parts gets `(n + 1) * p / 2`. Eleven lines in
thousands to one decimal get €600 of room, and that is the whole argument. The
moment tolerance becomes a setting, someone widens it to clear a red build.

**Blanks count as zero and are listed.** Every real P&L has empty rows, so
treating a blank as untestable would put an amber on all of them and the gate
would be ignored within a week. Treating it silently as zero invents a figure.
So: contribute zero, record the fact, and name it first when the subtotal
fails.

**A failure reports the single sign flips that would close it.** Deliberately
one flip, never two: two flips close almost any gap by coincidence, and a
diagnosis that fits everything diagnoses nothing. One repair means the
diagnosis is near certain. Zero repairs is the stronger finding, because it
says the stated figure does not follow from the rows above it under any
reading, so it did not come from them.

### The gate stands in front of the payment

You never pay to discover we could not read it. This also makes the refund
mechanic cheap, because the large majority of "nothing found" is filtered out
before money moves.

## Consequences

**It reorders the roadmap.** Gate, router, quote check, the found-versus-paid
line with its refund button, LER, and only then the PDF renderer. A report you
cannot trust does not need to be prettier. This is the third reordering in two
days, each on good grounds, which is itself a pattern worth watching. The gate
is the only item that occupied the same position in all three versions, which
is why it goes first regardless.

**Layer 2 does not exist for every document.** A rate card has no arithmetic. A
meeting note has none. For those, layers 0 and 1 plus type-specific structural
rules are all there is, and the default for an unrecognised type is red.

**The gate cannot see meaning, and that is on purpose.** In the workbook that
prompted this, tax is identical in two columns whose pre-tax profits differ by
€147.200, so one carries an effective rate of 17,2% and the other 25,0%. Both
subtract correctly. The gate passes them, and a test asserts that it does.
Catching that needs domain knowledge, which belongs in an analyzer.

**It is the one part of the product that can be guaranteed.** Everything
downstream is a judgement. This is not, and it is worth saying so on the site.

## Revisit when

- A real upload goes amber on a cell the owner insists is right. The override
  path exists in design (recorded as a user-asserted assumption, carried into
  the kernel's assumption load, lowering downstream confidence) but has not
  been built or tested against a live disagreement.
- Or when the first document type arrives that has no subtotals at all and
  still needs to be worth nine euros. The quote check is that case, and it will
  say whether layers 0 and 1 carry enough weight on their own.
