# /content — the publishing engine

Everything on this site except the homepage is a file in this folder. Adding a
page is adding a `.mdx` file. No code changes, no deploy configuration, no CMS.

```
content/
├── decisions/   →  /decision/{slug}    the commercial pages
├── blog/        →  /blog/{slug}        the informational supply
└── guides/      →  /guides/{slug}      long-form walkthroughs
```

**Decision pages are the destination. Blog posts are the road to them.** A blog
post should always link to the decision it supports, and the decision page
should list its supporting posts under `related`.

## Frontmatter

```yaml
---
title: What is my business worth?          # required, ≤120 chars
description: One sentence, ≤200 chars.     # required — used for meta + cards
slug: business-valuation                   # optional, defaults to the filename
date: 2026-07-20                           # required, YYYY-MM-DD
updated: 2026-07-27                        # optional — shown when it differs
author: MarginGraph
price: 9                                   # decisions only — shows the €9 card footer
category: Exit                             # generates /category/{category}
tags: [valuation, exit, EBITDA]            # generates /tags/{tag}
image: /og/business-valuation.png          # OpenGraph image
canonical: https://…                       # only for syndicated content
draft: true                                # excluded from every route and feed
featured: true
faq:                                       # renders an accordion + FAQ JSON-LD
  - question: Is my data stored?
    answer: …
related:                                   # explicit first, then auto-filled
  - blog/how-ebitda-affects-your-valuation
---
```

Only `title`, `description` and `date` are required. **Bad frontmatter fails the
build** — a missing description will not quietly ship.

One YAML rule worth knowing before it costs you ten minutes: any value
containing a colon followed by a space must be quoted, or YAML reads the rest
of the line as a nested key.

```yaml
description: "Usually one of three things: the earnings figure, the multiple, or concentration."
```

## What happens automatically

Route · sitemap entry · RSS item · canonical · OpenGraph · Twitter card ·
Article JSON-LD · FAQ JSON-LD · Breadcrumb JSON-LD · reading time · table of
contents · previous/next · related articles · tag pages · category pages ·
last-updated line.

## Components available in MDX

| Component | Props |
| --- | --- |
| `<Callout variant="note\|info\|warning\|success" title>` | children |
| `<Info>` `<Warning>` `<Success>` | shorthand for the above |
| `<Quote cite>` | children |
| `<Checklist items={[...]} />` | string array |
| `<Comparison columns={[...]} rows={[[...]]} />` | booleans render as ✓ / – |
| `<ProsCons pros={[...]} cons={[...]} prosTitle consTitle />` | |
| `<Metrics items={[{label, value, note}]} />` | |
| `<Cta title body href label />` | |
| `<Figure src alt caption width height />` | also aliased as `<Image>` |
| `<Video id title provider="youtube\|vimeo" />` | cookieless embed |
| `<Faq items={[{question, answer}]} />` | usually use frontmatter instead |
| `<BusinessValuationPreview />` `<ReportPreview />` | product previews |

Registered in `components/mdx/index.tsx`. Treat that map as a published API:
adding to it is free, removing from it breaks every document that used it.

## Rules that keep this working at 5,000 documents

1. **Slugs are permanent.** They are URLs. Renaming a file changes a URL.
2. **One file, one page.** No file produces two routes.
3. **`updated` is real.** Staleness is the failure mode of a reference site;
   the field exists so it is visible rather than hidden.
4. **Link decisions from blogs, always.** A post with no path to a decision
   page earns traffic and nothing else.
5. **Drafts stay drafts.** `draft: true` is excluded everywhere, including in
   development, so nothing half-finished can leak into a preview deployment.
