# Reasoning kernel

Domain-independent. Nothing here knows what a business is, what money is, or
what any metric means.

## What a new report costs

Two things, neither of them in this folder:

1. **An `Analyzer`** — domain logic. Turns evidence into claims.
2. **A `TemplateDefinition`** — configuration. Which claims appear, in what
   order, for whom.

Nothing in the kernel changes. That is the whole point of it, and it is
verified by `__tests__/kernel.test.ts`, which runs two deliberately unrelated
domains — bridge load capacity and crop yield — through the same engine.

## The claim layer

The engine receives a `ClaimSet` and nothing else. There is no parameter
through which a document could reach it, so "domain-independent" is a property
of the type signature rather than a promise in a document.

```
Evidence  ──┐
Assumption ─┼──▶ Analyzer ──▶ ClaimSet ──▶ reason() ──▶ Assessment ──▶ compose()
Knowledge ──┘     (domain)                  (kernel)                    (kernel)
```

## The six reasoners

Run in this order. Confidence must stay last — it reads the others rather than
recomputing anything, which is what keeps one definition of each concept.

| Reasoner | Answers |
|---|---|
| `traceability` | Does every claim lead back to something? |
| `evidence-quality` | How was it obtained, and how precisely is the source recorded? |
| `assumption-load` | How much rests on assumption rather than evidence? |
| `consistency` | Do any two claims about the same thing disagree? |
| `counterarguments` | Which single assumption, if wrong, changes the most? |
| `confidence` | All of the above, banded, with the components shown. |

A domain module cannot grade its own evidence or score its own confidence. If
it could, every analyzer would grade generously and the score would stop
meaning anything across reports.

## Rules the build enforces

- The kernel may not import from `domains/`, `templates/` or `knowledge/`.
- The kernel may not import Next or React.
- Templates may not import domain logic or the reasoning engine.

All three are ESLint rules, not conventions. A violation fails the build.

## Deliberately absent

Queues, caching, plugin loading, multi-tenancy, a second LLM provider, PDF
rendering, knowledge in a database. Each is cheap to add behind an existing
contract and expensive to carry before it is needed.

## Deliberately present from day one

Provenance on every value, the version manifest, the deterministic boundary,
and templates as configuration. None of the four can be retrofitted: the first
two cannot be recovered for reports already produced, and the second two set
the pattern that every later report will copy.
