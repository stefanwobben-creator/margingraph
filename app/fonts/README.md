# Fonts

## Zalando Sans Expanded

Self-hosted rather than loaded from Google Fonts, for three reasons:

1. **The Content-Security-Policy blocks it.** `style-src 'self'` and
   `font-src 'self' data:` would reject both the stylesheet from
   `fonts.googleapis.com` and the file from `fonts.gstatic.com`.
2. **Privacy.** A request to Google's CDN sends every visitor's IP address to
   Google before anything renders. This site sets no cookies and defers
   analytics consent; fetching a font from a third party would undo that on
   the very first byte.
3. **Speed.** `@import` costs two sequential round trips — the CSS, then the
   font — and cannot be preloaded. Self-hosting removes both.

The file is the **latin subset of the variable font**, which covers weights
450 and 850 from one 40 KB download. Weight-specific files would be two
requests for the same coverage.

Licensed under the SIL Open Font License 1.1 — see `OFL.txt`. Redistribution
inside a website is permitted; the licence file must travel with it, which is
why it is committed here rather than referenced.

Source: `https://fonts.gstatic.com/s/zalandosansexpanded/v3/` — retrieved
2026-07-28. Re-download from the Google Fonts CSS API if the family is ever
updated; `v3` in the path is the family version, not the file version.
