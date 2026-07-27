# Go-live checklist

Everything below requires a human. Everything not below is done and verified —
see the audit summary in the commit `chore: production readiness`.

## Blocking — the site should not be public without these

### 1. Legal pages

Nothing has been written for these, deliberately. A generated privacy policy is
a fabricated legal document, and one that is wrong is worse than one that is
absent.

- [ ] **Privacy statement.** Required under GDPR. Must state what is collected,
      on what lawful basis, how long it is kept, who processes it, and how to
      exercise subject rights. The report product will process uploaded
      financial data — that has to be covered before the first upload, not
      after.
- [ ] **Terms of service.** Particularly the disclaimer that a report is an
      indicative estimate and not a formal valuation. The FAQ says this in
      several places; the terms have to say it bindingly.
- [ ] **Imprint / company details.** Dutch and EU rules require the legal name,
      KvK number, VAT number and a contact address on a commercial site.
- [ ] **Cookie statement**, if analytics is ever added. Not needed while the
      site sets no cookies — which is currently true.

Once written, add them as `.mdx` files and link them from the footer.

### 2. Domain and environment

- [ ] Point the domain at Vercel and confirm the certificate issues.
- [ ] `public/robots.txt` hardcodes `https://margingraph.com/sitemap.xml`. If the
      production domain is anything else, edit that line — preview deployments
      will point crawlers at production, which is the correct behaviour and
      worth knowing.
- [ ] Set **`NEXT_PUBLIC_SITE_URL`** to the production origin, with no trailing
      slash. Without it, canonicals, the sitemap, RSS and every absolute URL in
      structured data fall back to the Vercel preview domain.
- [ ] Decide www or apex, and redirect the other permanently. Two origins
      serving identical content splits ranking signals.

### 3. Dead call-to-action buttons

- [ ] Every "Generate Report" button currently links to `#`. There is no
      checkout and no upload. Either connect them or change the label before
      launch — a button that does nothing costs more trust than a missing one.

## Before announcing

- [ ] Verify the domain in Google Search Console and Bing Webmaster Tools, then
      submit `/sitemap.xml`.
- [ ] Test three pages in the Rich Results Test — a decision page, a blog post
      and an FAQ page.
- [ ] Run Lighthouse against the production URL. The local build is clean, but
      real network conditions and the real domain are what get measured.
- [ ] Decide on analytics. Nothing is installed. A cookieless, EU-hosted option
      avoids needing a consent banner; anything else means a cookie statement
      and a banner, and the CSP in `next.config.ts` must be updated to allow the
      script origin or it will be silently blocked.
- [ ] Replace the generated letter-mark favicon (`app/icon.tsx`) if a real
      identity exists.

## Worth doing in the first month

- [ ] Add an `updated` date to content as it changes. Staleness is the failure
      mode of a reference site.
- [ ] Watch Search Console for the `noindex` taxonomy pages — they are excluded
      on purpose while they list fewer than two documents, and they start being
      indexed automatically once they do not.
- [ ] Set up an uptime check. The site is static, so the realistic failure is a
      bad deploy rather than an outage.
- [ ] Consider `generateSitemaps` sharding if the page count passes ~10,000.
      At 96 pages this is years away.

## Deployment settings for Vercel

| Setting | Value |
|---|---|
| Framework preset | Next.js (auto-detected) |
| Build command | `npm run build` |
| Install command | `npm install` |
| Node version | 20.x or later — pinned via `engines` in `package.json` |
| Environment variable | `NEXT_PUBLIC_SITE_URL` (production and preview) |

`npm run check` runs typecheck, lint and build in one command. It is what CI
should run, and it is what should pass before any deploy.
