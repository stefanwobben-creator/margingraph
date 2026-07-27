# MarginGraph Documentation

This folder is the **single source of truth** for MarginGraph: what we are building, why,
for whom, and how the system is put together.

Rule: if a decision is not written here, it is not decided. If code contradicts a document,
one of the two is a bug — resolve it explicitly, do not let them drift.

---

## How to use this repository (humans and AI agents)

1. **Read `00-foundation/` first.** Vision, mission and principles constrain everything below.
2. **Read the layer you are working in**, plus the documents it declares in `depends-on`.
3. **Never invent facts.** Anything marked `_TBD_` is genuinely undecided. Ask, or propose —
   do not silently assume.
4. **Changing a decision means changing the document**, in the same change-set as the code.
5. **Non-obvious or contested decisions get an ADR** in `decisions/`. Documents describe the
   current state; ADRs describe why it changed.

---

## Map

| Layer | Folder | Answers |
|---|---|---|
| Foundation | [`00-foundation/`](00-foundation/) | Why we exist and what we refuse to do |
| Business | [`01-business/`](01-business/) | How value is created, captured, sequenced and eventually realised |
| Graph | [`02-graph/`](02-graph/) | What we actually know, how it is modelled, where it comes from |
| Intelligence | [`03-intelligence/`](03-intelligence/) | How AI turns raw sources into graph, and graph into answers |
| Platform | [`04-platform/`](04-platform/) | How it is stored, served, secured and shown |
| Growth | [`05-growth/`](05-growth/) | How the world finds us |
| Architecture | [`architecture/`](architecture/) | How the report platform is put together |
| Decisions | [`decisions/`](decisions/) | Why things changed |

### Documents

**00 · Foundation**
- [Vision](00-foundation/vision.md) — the 10-year end state
- [Mission](00-foundation/mission.md) — what we do every day to get there
- [Principles](00-foundation/principles.md) — how we decide when the answer is unclear
- [Glossary](00-foundation/glossary.md) — shared vocabulary; terms are binding

**01 · Business**
- [Business Model](01-business/business-model.md)
- [Product Strategy](01-business/product-strategy.md)
- [Roadmap](01-business/roadmap.md)
- [Exit Strategy](01-business/exit-strategy.md)

**02 · Graph**
- [Knowledge Graph](02-graph/knowledge-graph.md) — the core asset and its laws
- [Ontology](02-graph/ontology.md) — entities, relations, attributes
- [Data Sources](02-graph/data-sources.md) — acquisition, licensing, trust

**03 · Intelligence**
- [AI Strategy](03-intelligence/ai-strategy.md) — where AI creates leverage, and where it must not be trusted
- [LLM Architecture](03-intelligence/llm-architecture.md)
- [Agent Architecture](03-intelligence/agent-architecture.md)

**04 · Platform**
- [Database](04-platform/database.md)
- [API](04-platform/api.md)
- [UI](04-platform/ui.md)
- [Security](04-platform/security.md)

**Architecture**
- [Report platform](architecture/report-platform.md) — the engine that produces every report

**05 · Growth**
- [SEO](05-growth/seo.md)

---

## Document conventions

Every document starts with frontmatter:

```yaml
---
doc: <slug>
status: stub | draft | reviewed | stable
owner: <person>
last-reviewed: <YYYY-MM-DD>
depends-on: [<slug>, ...]
---
```

- `status: stub` — structure only, no decisions made yet.
- `status: draft` — content exists, not agreed.
- `status: reviewed` — agreed by founders, safe to build against.
- `status: stable` — changing this breaks things; requires an ADR.
- `depends-on` — documents whose decisions constrain this one. Read those first.

Style: short sentences, explicit trade-offs, no marketing language. Write what is true and
what is undecided. A document that hides uncertainty is worse than no document.

---

## Status

All documents are currently `stub`. Nothing here has been decided yet.
