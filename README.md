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
app/                  routes and root layout
├── layout.tsx        html shell, fonts, metadata, header/footer
├── globals.css       tailwind + shadcn tokens (entry point)
└── page.tsx          placeholder, replace with the first real page

components/
├── layout/           container, site header, site footer
└── ui/               shadcn/ui primitives (generated — edit with care)

content/
├── articles/         long-form pages (file-based)
└── decisions/        entity pages (file-based)

lib/
├── site.ts           site-level constants, used by metadata
└── utils.ts          cn() helper

styles/
└── theme.css         design tokens: measure, accent, type scale

public/               static assets
docs/                 strategy documentation (not shipped)
```

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
