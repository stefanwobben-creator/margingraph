# /content

File-based content. No CMS, no database — content lives in the repo and ships
with the build, so every page is statically generated and cheap to serve.

```
content/
├── articles/    long-form explanatory pages
└── decisions/   the entity pages: one file per decision
```

Nothing is wired up yet. When it is, these are the constraints to hold:

- **One file = one URL.** The filename is the slug. Slugs are permanent.
- **Frontmatter is a contract.** Validate it at build time (zod) and fail the
  build on a bad file rather than shipping a broken page.
- **Every factual claim carries its source.** That is the whole point of this
  project; do not add a content type that cannot cite.
- **`updated` is a real date.** Stale content is the failure mode of a
  reference site — the field exists so staleness is visible.

Suggested frontmatter, to be formalised in `lib/content.ts`:

```yaml
---
title: ""
slug: ""
summary: ""
published: 2026-01-01
updated: 2026-01-01
status: draft # draft | published
sources: []
---
```
