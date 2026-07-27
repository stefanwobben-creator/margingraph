# MarginGraph

Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui · ESLint 9

Foundation only. No pages have been built yet.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint     # eslint
```

## Structure

```
app/                  routes — thin files that delegate to the engine
├── layout.tsx        html shell, fonts, metadata, header/footer
├── page.tsx          homepage
├── decision/ blog/ guides/ reports/   generated from /content
├── tags/[tag]/       global tag pages
├── feed.xml/         RSS
├── sitemap.ts        generated from the content tree
└── robots.ts

content/              every page except the homepage — see content/README.md
├── decisions/  →  /decision/{slug}
├── blog/       →  /blog/{slug}
├── guides/     →  /guides/{slug}
└── reports/    →  /reports/{slug}

lib/content/          the engine
├── types.ts          the Doc contract
├── collections.ts    registry — add a content type here
├── schema.ts         frontmatter validation (fails the build)
├── source.ts         filesystem read, cache, taxonomy, relations
├── mdx.tsx           MDX compilation
├── toc.ts            heading extraction
├── seo.ts            metadata + JSON-LD, used by every route
└── routes.tsx        route factory — index, detail and category pages

components/
├── content/          document layout: header, TOC, pager, related, cards
├── mdx/              components authors may use inside .mdx
├── layout/           container, section, header, footer
├── sections/         homepage sections
└── ui/               shadcn/ui primitives

styles/
├── theme.css         design tokens
└── prose.css         markdown typography
```

## Publishing

Add a `.mdx` file to `content/`. That is the whole workflow — routes, sitemap,
RSS, canonical, OpenGraph, JSON-LD, reading time, table of contents,
previous/next, related articles and tag pages all follow from the file.

See [`content/README.md`](content/README.md) for the frontmatter contract and
the components available inside MDX.

Adding a new *content type* is one entry in `lib/content/collections.ts` plus
three route files that re-export `createCollectionRoutes(...)`.

## Design system

Deliberately minimal. Three decisions, and everything else follows from them.

| | |
|---|---|
| Surface | white background, near-black text |
| Accent | one colour (`--accent-brand`, a restrained blue) for links, focus rings and emphasis. Nothing else is coloured. |
| Measure | `max-w-page` = 1200px shell · `max-w-prose-page` = ~700px reading width |

Type scale is fluid and capped: `text-display`, `text-title`, `text-heading`,
`text-lead`, plus the Tailwind defaults. Body text is 16px / 1.7.

Use `<Container>` for horizontal rhythm — do not hand-roll `max-w-*` wrappers,
or the measure will drift.

Tokens live in `styles/theme.css`. shadcn/ui writes to `app/globals.css`, which
imports the theme; keep them in that order.

## Deployment (Vercel)

1. Import the repository in Vercel. The framework preset is detected.
2. Set `NEXT_PUBLIC_SITE_URL` to the production domain — `metadataBase`,
   canonical URLs and Open Graph tags depend on it.
3. Build command `npm run build`, output directory default.

No other configuration is required.
