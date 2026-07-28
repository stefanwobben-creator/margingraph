#!/usr/bin/env node
/**
 * Production smoke test.
 *
 * Checks the things that are invisible until they are wrong: which host
 * actually serves, whether the canonical agrees with it, whether analytics is
 * loading, and whether the security headers survived the last deploy.
 *
 *   npm run verify:live
 *   npm run verify:live -- https://staging.example.com
 *
 * Exits non-zero on failure, so it can gate a deploy later.
 */

const ORIGIN = process.argv[2] ?? "https://margingraph.com";
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-E7GRQPPEEP";

const results = [];
const record = (ok, name, detail) => results.push({ ok, name, detail });

async function head(url) {
  const response = await fetch(url, { redirect: "manual" });
  return {
    status: response.status,
    location: response.headers.get("location"),
    headers: response.headers,
  };
}

async function main() {
  const url = new URL(ORIGIN);
  const apex = `https://${url.hostname.replace(/^www\./, "")}`;
  const www = `https://www.${url.hostname.replace(/^www\./, "")}`;

  /* ---------------------------------------------------------- host --------- */

  const [apexHead, wwwHead] = await Promise.all([head(apex), head(www)]);

  let servingOrigin;
  if (apexHead.status >= 300 && apexHead.status < 400) {
    servingOrigin = new URL(apexHead.location).origin;
    record(
      true,
      "Canonical host",
      `apex redirects (${apexHead.status}) to ${servingOrigin}`,
    );
  } else if (wwwHead.status >= 300 && wwwHead.status < 400) {
    servingOrigin = new URL(wwwHead.location).origin;
    record(
      true,
      "Canonical host",
      `www redirects (${wwwHead.status}) to ${servingOrigin}`,
    );
  } else {
    servingOrigin = apex;
    record(
      false,
      "Canonical host",
      "Both apex and www return 200. Two origins serving identical content splits ranking signals — one must redirect to the other.",
    );
  }

  /* ------------------------------------------------------- canonical ------- */

  const html = await fetch(servingOrigin).then((r) => r.text());
  const canonical = html.match(/rel="canonical"\s+href="([^"]+)"/)?.[1];

  if (!canonical) {
    record(false, "Canonical tag", "No canonical tag on the homepage.");
  } else {
    const canonicalOrigin = new URL(canonical).origin;
    record(
      canonicalOrigin === servingOrigin,
      "Canonical matches host",
      canonicalOrigin === servingOrigin
        ? canonical
        : `Canonical says ${canonicalOrigin} but ${servingOrigin} serves. Every URL given to search engines redirects. Fix NEXT_PUBLIC_SITE_URL or the primary domain — not both.`,
    );
  }

  /* --------------------------------------------------------- sitemap ------- */

  const sitemap = await fetch(`${servingOrigin}/sitemap.xml`);
  const sitemapBody = sitemap.ok ? await sitemap.text() : "";
  const firstLoc = sitemapBody.match(/<loc>([^<]+)<\/loc>/)?.[1];

  record(sitemap.ok, "Sitemap reachable", `${sitemap.status} ${servingOrigin}/sitemap.xml`);
  if (firstLoc) {
    const locOrigin = new URL(firstLoc).origin;
    record(
      locOrigin === servingOrigin,
      "Sitemap URLs match host",
      locOrigin === servingOrigin ? firstLoc : `Sitemap lists ${locOrigin}`,
    );
  }

  /* --------------------------------------------------------- robots -------- */

  const robots = await fetch(`${servingOrigin}/robots.txt`).then((r) => r.text());
  record(
    robots.includes("Sitemap:"),
    "robots.txt references the sitemap",
    robots.split("\n").find((l) => l.startsWith("Sitemap:")) ?? "missing",
  );
  record(
    !robots.includes("Disallow: /"),
    "Production is crawlable",
    robots.includes("Disallow: /")
      ? "robots.txt disallows everything — this build thinks it is a preview."
      : "Allow: /",
  );

  /* ------------------------------------------------------- analytics ------- */

  const hasGaScript = html.includes("googletagmanager.com/gtag/js");
  const hasGaId = html.includes(GA_ID);
  const hasNoAutoPageview = html.includes("send_page_view: false");
  const hasConsent = html.includes("analytics_storage");

  record(
    hasGaScript && hasGaId,
    "Google Analytics loaded",
    hasGaScript
      ? `${GA_ID} present`
      : "No gtag script. NEXT_PUBLIC_GA_MEASUREMENT_ID is not set for this environment, or the deploy predates it.",
  );
  if (hasGaScript) {
    record(hasNoAutoPageview, "No duplicate page views", "send_page_view: false");
    record(hasConsent, "Consent Mode initialised", "analytics_storage declared");
    const csp = (await head(servingOrigin)).headers.get("content-security-policy") ?? "";
    record(
      csp.includes("googletagmanager.com"),
      "CSP allows analytics",
      csp.includes("googletagmanager.com")
        ? "googletagmanager permitted"
        : "CSP does not list googletagmanager — gtag will be blocked silently.",
    );
  }

  /* --------------------------------------------------------- headers ------- */

  const headers = (await head(servingOrigin)).headers;
  for (const header of [
    "content-security-policy",
    "strict-transport-security",
    "x-content-type-options",
    "referrer-policy",
  ]) {
    record(Boolean(headers.get(header)), `Header ${header}`, headers.get(header)?.slice(0, 60) ?? "missing");
  }

  /* ----------------------------------------------------------- output ------ */

  const pad = Math.max(...results.map((r) => r.name.length));
  console.log(`\n  ${servingOrigin}\n`);
  for (const { ok, name, detail } of results) {
    console.log(`  ${ok ? "✓" : "✗"} ${name.padEnd(pad)}  ${detail}`);
  }

  const failed = results.filter((r) => !r.ok);
  console.log(
    `\n  ${results.length - failed.length}/${results.length} passed\n`,
  );
  process.exit(failed.length > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(`\n  Could not reach ${ORIGIN}: ${error.message}\n`);
  process.exit(1);
});
