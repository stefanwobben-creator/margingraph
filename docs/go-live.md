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
- [ ] Set **`NEXT_PUBLIC_SITE_URL`** to the production origin, with no trailing
      slash. Without it, canonicals, the sitemap, RSS, robots.txt and every
      absolute URL in structured data fall back to the Vercel preview domain.
      It is now the only place the domain is written down.
- [ ] **Make the apex the primary domain in Vercel**, so `www` redirects to
      `margingraph.com` instead of the other way round.

      Vercel → Project → Settings → Domains → `margingraph.com` → set as
      primary. Vercel then issues the `www` → apex redirect itself.

      Apex is the right choice here: the code already uses it everywhere, and
      the usual argument for `www` — that DNS cannot put a CNAME on an apex —
      does not apply, because the apex already resolves via an A record to
      Vercel.

      **Do not add a `www` → apex redirect in `next.config.ts` while Vercel's
      primary is still `www`.** Vercel redirects apex → www at the edge before
      Next sees the request; a Next-level redirect back would loop.

      Verify afterwards with `npm run verify:live`.

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
- [ ] **Analytics: add `NEXT_PUBLIC_GA_MEASUREMENT_ID` in Vercel.** See the
      section below — there are two settings that must both be right or page
      views will double.
- [ ] Replace the generated letter-mark favicon (`app/icon.tsx` and
      `app/apple-icon.tsx`) if a real identity exists. The apple-icon is also
      what the Organization schema declares as the company logo, so a real mark
      improves both the browser tab and the knowledge panel.
- [ ] Add `sameAs` to the Organization schema once verified profiles exist
      (LinkedIn, X, Crunchbase). It is deliberately absent rather than guessed —
      pointing at a profile you do not control is worse than omitting it.
- [ ] Add `address` and `contactPoint` to the Organization schema when the
      imprint is written. The same KvK and address details serve both.

## Worth doing in the first month

- [ ] Add an `updated` date to content as it changes. Staleness is the failure
      mode of a reference site.
- [ ] Watch Search Console for the `noindex` taxonomy pages — they are excluded
      on purpose while they list fewer than two documents, and they start being
      indexed automatically once they do not.
- [ ] Set up an uptime check. The site is static, so the realistic failure is a
      bad deploy rather than an outage.
- [ ] `generateSitemaps` sharding once the sitemap passes 50,000 URLs. The
      build throws before that point rather than shipping an oversized file, so
      this cannot be missed silently.
- [ ] `llms.txt` is a proposed convention, not a standard. Check once a year
      whether it is still worth serving; nothing depends on it.

## Google Analytics 4

GA4 is implemented but dormant. It loads nothing — no script, no connection to
Google, and no analytics origins in the Content-Security-Policy — until a
measurement ID exists.

### What to add in Vercel

| Variable | Value | Environments |
|---|---|---|
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | `G-XXXXXXXXXX` from GA4 → Admin → Data streams → your web stream | **Production only** |

Do not set it for Preview. Tracking is additionally gated on a real production
deploy, so a preview would send nothing anyway — but leaving it unset keeps the
CSP tight there too.

### The GA4 admin setting that must match

In **Admin → Data streams → your stream → Enhanced measurement**, turn **off**
"Page changes based on browser history events".

This is not optional. The application sends page views explicitly, with
`send_page_view: false` in the gtag config. If GA4 also fires its own view on
every history change, every client-side navigation is counted twice.

The trade is deliberate: explicit page views arrive after the new page title is
set, so `page_title` is correct. GA4's own history tracking fires earlier and
frequently records the previous page's title.

### Consent

Consent Mode v2 is initialised with everything **denied**. No `_ga` cookie is
set and GA4 receives only cookieless pings until consent is granted.

Nothing grants it yet, because there is no consent banner. When one is built,
it calls a single function:

```ts
import { setAnalyticsConsent } from "@/lib/analytics";
setAnalyticsConsent(true);   // or false
```

The decision is remembered in `localStorage` and re-applied on the next visit.

- [ ] Build a consent banner, or accept that GA4 reports modelled data only.
- [ ] Write the cookie statement once the banner sets cookies.

### Tracking an event

```ts
import { trackEvent } from "@/lib/analytics";

trackEvent("waitlist_joined", { source: "footer" });
```

Names and parameters are typed in `lib/analytics/events.ts`. Adding an event is
one line there. There are no inline `gtag()` calls anywhere in the application —
`lib/analytics/gtag.ts` is the only file that touches the vendor API.

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
