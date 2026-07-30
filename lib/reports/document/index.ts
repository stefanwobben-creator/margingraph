import type { Supplied } from "@/lib/reports/catalogue";
import { REPORTS, offer, type ReportId } from "@/lib/reports/catalogue";
import {
  MINIMUM_WORTH,
  REPORT_PRICE,
  findAll,
  render,
  teaser,
} from "@/lib/reports/findings";
import { portrait } from "@/lib/reports/findings/portrait";
import type { Finding, FindingsInput } from "@/lib/reports/findings/types";
import { questionsForYourAccountant } from "@/lib/reports/questions";
import { runwayReport, type RunwayOptions } from "@/lib/reports/runway";
import { signalsReport } from "@/lib/reports/signals";
import { pricingReport, shockReport } from "@/lib/reports/whatif";

/**
 * The deliverable. Everything upstream exists so that this file can be
 * honest; this file exists so that the honesty looks like it cost nine euros.
 *
 * One self-contained HTML document per report, print-ready at A4, no external
 * fonts, scripts or images, because the file will be attached to an email and
 * opened on whatever the buyer owns. The design rule is the site's: black on
 * white, one typeface, and nothing decorative that is not information.
 *
 * Every renderer here draws from the same engine calls as the CLI and the
 * reply email. Nothing is computed in this file beyond string formatting, so
 * the document can never tell a different story than the terminal did.
 */

export type DocumentMeta = {
  /** What the sender sent, in their words: a filename usually. */
  source: string;
  /** The day the report was produced, already formatted. */
  date: string;
  /** Who it was produced for, if known. */
  recipient?: string;
};

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const euro = (n: number) => `€${Math.round(Math.abs(n)).toLocaleString("en-GB")}`;

/**
 * Engine prose into HTML: blank lines split paragraphs, indented runs are
 * kept as figure blocks in a monospaced face, because their alignment is
 * their meaning.
 */
function prose(text: string): string {
  const blocks: string[] = [];
  let mono: string[] = [];
  const flush = () => {
    if (mono.length) {
      blocks.push(`<pre class="figures">${esc(mono.join("\n"))}</pre>`);
      mono = [];
    }
  };
  for (const paragraph of text.trim().split(/\n{2,}/)) {
    const lines = paragraph.split("\n");
    if (lines.every((l) => l.startsWith("  ") || l.trim() === "")) {
      mono.push(...lines.map((l) => l.replace(/^ {2}/, "")));
      continue;
    }
    flush();
    if (paragraph.trim().startsWith("Check:")) {
      blocks.push(`<p class="check">${esc(paragraph.trim())}</p>`);
    } else {
      blocks.push(`<p>${esc(paragraph.replace(/\n/g, " ").trim())}</p>`);
    }
  }
  flush();
  return blocks.join("\n");
}

function findingBlock(f: Finding, index: number): string {
  const parts: string[] = [`<section class="finding">`];
  parts.push(`<h3><span class="index">${index}</span>${esc(f.subject)}</h3>`);
  if (f.plainly) parts.push(`<p class="plainly">${esc(f.plainly)}</p>`);
  parts.push(`<table class="facts"><tbody>`);
  parts.push(`<tr><th>Yours</th><td>${esc(f.observation)}</td></tr>`);
  parts.push(
    `<tr><th>Worth</th><td><strong>${euro(f.worth)}</strong> at most (${esc(f.per)})${
      f.recommended !== undefined && f.recommended < f.worth
        ? ` — the step we recommend below is worth ${euro(f.recommended)}`
        : ""
    }</td></tr>`,
  );
  parts.push(`<tr><th>Do</th><td>${esc(f.action)}</td></tr>`);
  parts.push(`<tr><th>Check</th><td class="check">${esc(f.workings)}</td></tr>`);
  parts.push(`</tbody></table>`);
  if (f.ladder?.length) {
    parts.push(`<table class="ladder"><thead><tr><th>Step</th><th>Worth</th><th>Safe while</th></tr></thead><tbody>`);
    for (const step of f.ladder) {
      parts.push(
        `<tr><td>${esc(step.move)}</td><td class="num">${euro(step.worth)}</td><td>${
          step.breakEvenShare !== undefined
            ? `you lose under ${(step.breakEvenShare * 100).toFixed(1)}% of turnover`
            : "—"
        }</td></tr>`,
      );
    }
    parts.push(`</tbody></table>`);
  }
  if (f.caveat) parts.push(`<p class="caveat">${esc(f.caveat)}</p>`);
  parts.push(`</section>`);
  return parts.join("\n");
}

/** The portrait and single-denominator cascade, as the opening spread. */
function portraitSection(input: FindingsInput): string {
  const p = portrait(input);
  if (p.lines.length === 0) return "";
  const rows = p.lines
    .map((l) => `<tr><th>${esc(l.label)}</th><td>${esc(l.value)}</td></tr>`)
    .join("\n");

  let cascadeHtml = "";
  if (p.cascade.length > 0) {
    let aside = "";
    const bars = p.cascade
      .map((line) => {
        const negative = line.value.startsWith("−");
        const cents = Number(line.value.match(/^(\d+)/)?.[1] ?? 0);
        const width = Math.min(100, Math.max(2, cents));
        const bar = negative ? "" : `<span style="width:${width}%"></span>`;
        // A long value is a value with an explanation attached. The number
        // stays on the row; the explanation moves under the table, where it
        // can wrap without breaking the alignment that makes this readable.
        const [value, explanation] = line.value.split(/:\s*/, 2);
        if (explanation) aside = `${line.label}: ${explanation}.`;
        return `<tr><th>${esc(line.label)}</th><td class="bar">${bar}</td><td class="num">${esc(value)}</td></tr>`;
      })
      .join("\n");
    cascadeHtml =
      `<h3>Of every euro you keep after buying — which is the first money that is actually yours:</h3>` +
      `<table class="cascade">${bars}</table>` +
      (aside ? `<p class="note">${esc(aside)}</p>` : "");
  }

  return `<section><h2>Your figures, before anything is wrong with them</h2>
<table class="portrait">${rows}</table>
${cascadeHtml}
<p class="note">Every line above is arithmetic on your own file. No judgement is attached:
whether these numbers are good is a question about your market, and this page cannot know it.</p>
</section>`;
}

// --- the shared frame -------------------------------------------------------

const CSS = `
  :root { --ink: #171717; --faint: #8a8a8a; --line: #e5e5e5; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body {
    font-family: "Geist", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    color: var(--ink); background: #fff;
    font-size: 11pt; line-height: 1.55;
    max-width: 178mm; margin: 0 auto; padding: 18mm 0 24mm;
  }
  header.doc { display: flex; justify-content: space-between; align-items: baseline;
    border-bottom: 2px solid var(--ink); padding-bottom: 10px; }
  .wordmark { font-size: 15pt; letter-spacing: 0.02em; }
  .wordmark b { font-weight: 750; } .wordmark span { font-weight: 400; }
  .docmeta { text-align: right; color: var(--faint); font-size: 9pt; line-height: 1.5; }
  h1 { font-size: 21pt; line-height: 1.2; font-weight: 700; margin: 26px 0 6px; letter-spacing: -0.01em; }
  .standfirst { font-size: 12pt; color: var(--faint); margin-bottom: 8px; max-width: 60ch; }
  h2 { font-size: 13pt; margin: 30px 0 10px; padding-top: 14px; border-top: 1px solid var(--line); }
  h3 { font-size: 11pt; margin: 18px 0 8px; font-weight: 600; }
  p { margin: 8px 0; max-width: 70ch; }
  .headline { font-size: 13pt; font-weight: 600; margin: 16px 0; max-width: 60ch; }
  table { border-collapse: collapse; width: 100%; margin: 10px 0 16px; font-size: 10.5pt; }
  th { text-align: left; font-weight: 500; }
  .portrait th, .portrait td { padding: 6px 8px 6px 0; border-bottom: 1px solid var(--line); vertical-align: top; }
  .portrait th { width: 42%; color: var(--faint); font-weight: 400; }
  .portrait td { font-weight: 600; font-variant-numeric: tabular-nums; }
  .cascade th { width: 32%; color: var(--ink); font-weight: 400; padding: 5px 12px 5px 0; white-space: nowrap; }
  .cascade td.bar { width: 46%; padding: 5px 10px 5px 0; }
  .cascade td.bar span { display: block; height: 11px; background: var(--ink); border-radius: 1px; }
  .cascade td.num { font-variant-numeric: tabular-nums; white-space: nowrap; font-weight: 600; }
  .finding { margin: 22px 0; padding: 14px 16px; border: 1px solid var(--line); border-radius: 6px;
    break-inside: avoid; }
  .finding h3 { margin-top: 0; display: flex; gap: 10px; align-items: baseline; }
  .finding .index { font-weight: 700; color: var(--faint); }
  .facts th { width: 14%; color: var(--faint); font-weight: 400; vertical-align: top; padding: 4px 8px 4px 0; }
  .facts td { padding: 4px 0; }
  .plainly { color: var(--faint); font-size: 10pt; max-width: 68ch; }
  .check, td.check { font-family: ui-monospace, "Geist Mono", SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 9pt; color: var(--faint); }
  .ladder { margin-top: 8px; font-size: 9.5pt; }
  .ladder th { color: var(--faint); font-weight: 400; border-bottom: 1px solid var(--line); padding: 3px 12px 3px 0; }
  .ladder td { border-bottom: 1px solid var(--line); padding: 4px 12px 4px 0; }
  .ladder td.num { font-variant-numeric: tabular-nums; white-space: nowrap; }
  pre.figures { font-family: ui-monospace, "Geist Mono", SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 9.5pt; line-height: 1.6; padding: 12px 14px; border: 1px solid var(--line);
    border-radius: 6px; overflow-x: auto; margin: 12px 0; }
  .caveat, .note { color: var(--faint); font-size: 9.5pt; max-width: 68ch; }
  .offer td, .offer th { padding: 5px 8px 5px 0; border-bottom: 1px solid var(--line); vertical-align: top; }
  .offer .price { white-space: nowrap; font-variant-numeric: tabular-nums; text-align: right; font-weight: 600; }
  .offer .why { color: var(--faint); font-size: 9.5pt; }
  .signals td, .signals th { padding: 6px 10px 6px 0; border-bottom: 1px solid var(--line); }
  .signals .dir { font-size: 12pt; width: 24px; }
  .question { margin: 18px 0; break-inside: avoid; }
  .question .ask { font-weight: 600; max-width: 65ch; }
  .question .why, .question .good { font-size: 10pt; color: var(--faint); max-width: 68ch; margin-top: 4px; }
  .question .good b { color: var(--ink); font-weight: 600; }
  .paybox { border: 1.5px solid var(--ink); border-radius: 6px; padding: 14px 16px; margin: 22px 0; }
  footer.doc { margin-top: 36px; border-top: 1px solid var(--line); padding-top: 10px;
    color: var(--faint); font-size: 8.5pt; line-height: 1.6; }
  @page { size: A4; margin: 14mm 16mm; }
  @media print { body { padding: 0; max-width: none; } }
`;

function frame(opts: {
  title: string;
  standfirst: string;
  meta: DocumentMeta;
  body: string;
  free: boolean;
}): string {
  const { title, standfirst, meta, body, free } = opts;
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} — MarginGraph</title>
<style>${CSS}</style></head>
<body>
<header class="doc">
  <div class="wordmark"><b>MARGIN</b><span>Graph</span></div>
  <div class="docmeta">
    ${esc(meta.date)}<br>
    Read from: ${esc(meta.source)}${meta.recipient ? `<br>Prepared for: ${esc(meta.recipient)}` : ""}<br>
    ${free ? "Free — nothing in this document is charged for" : `Paid report — €${REPORT_PRICE}`}
  </div>
</header>
<h1>${esc(title)}</h1>
<p class="standfirst">${esc(standfirst)}</p>
${body}
<footer class="doc">
  MarginGraph is Stefan Wobben Advies, KvK 70889945, VAT NL001397170B41 — info@margingraph.com — margingraph.com<br>
  Your file was read to produce this document and is then deleted. Every amount above can be recomputed
  from your own file using the Check lines; if one of them does not survive that, tell us and the report is free.
  This is analysis of the figures you sent, not accounting, audit or investment advice.
</footer>
</body></html>`;
}

// --- the documents ----------------------------------------------------------

export type PaidOptions = {
  cash?: number;
  months?: number;
};

/** What the sender gets for nothing: portrait, teaser, and the offer. */
export function freeDocument(input: FindingsInput, supplied: Supplied, meta: DocumentMeta): string {
  const findings = findAll(input);
  const t = teaser(findings, input);

  const locked = t.unlockable
    ? `<h2>What we found, and what each one is worth</h2>
<table class="offer">${[...findings]
        .sort((a, b) => b.worth - a.worth)
        .map(
          (f, i) =>
            `<tr><td>${i + 1}. ${esc(f.subject)}</td><td class="price">${euro(f.worth)}</td></tr>`,
        )
        .join("\n")}</table>
<p>€${REPORT_PRICE} unlocks which line each of these sits on, the arithmetic behind it, and what
to do about it — including how far you can safely go.</p>`
    : `<h2>What we found</h2>
<p>We read your file looking for money you are leaving behind and found ${euro(t.recommended)}
worth acting on. That is below the €${MINIMUM_WORTH} we hold ourselves to, so there is nothing to
sell you and nothing to pay. Your figures are in better order than most we read.</p>`;

  const items = offer(supplied);
  const offerRows = items
    .map((o) => {
      if (o.sellable || o.because?.includes("free"))
        return `<tr><td>☑ ${esc(o.question)}</td><td class="price">in your report</td></tr>`;
      return `<tr><td class="why">☐ ${esc(o.question)}</td><td class="why">${esc(o.because ?? "")}</td></tr>`;
    })
    .join("\n");
  const sellable = items.filter((o) => o.sellable).length;

  return frame({
    title: "What your figures say",
    standfirst: `One file, read line by line. This page is free; the full report is €${REPORT_PRICE}.`,
    meta,
    free: true,
    body: `${portraitSection(input)}
${locked}
<h2>The chapters of your report</h2>
<table class="offer">${offerRows}</table>
${
  sellable > 0
    ? `<div class="paybox"><p><strong>One report, €${REPORT_PRICE}.</strong> It contains every marked
chapter above. The open lines say what to send to add those chapters — send it whenever you
like, before or after buying, and we reissue the report at no charge.</p></div>`
    : ""
}`,
  });
}

/**
 * A chapter of the one report: its heading, or nothing if the file cannot
 * carry it. The chapter numbering is done by the composer, because a chapter
 * does not know who its neighbours are.
 */
function chapter(
  id: ReportId,
  input: FindingsInput,
  options: PaidOptions,
): { title: string; html: string } | undefined {
  if (id === "margin") {
    // The report's own headline already leads the document, so the chapter
    // goes straight to the findings.
    const report = render(findAll(input));
    return {
      title: "Where your margin is leaking",
      html: report.findings.map((f, i) => findingBlock(f, i + 1)).join("\n"),
    };
  }
  if (id === "shock") {
    const report = shockReport(input);
    if (!report) return undefined;
    return { title: "What a 20% drop would do", html: prose(report.text) };
  }
  if (id === "pricing") {
    const report = pricingReport(input);
    if (!report) return undefined;
    return { title: "What a price change can cost", html: prose(report.text) };
  }
  if (id === "runway") {
    if (options.cash === undefined) return undefined;
    const report = runwayReport(input, options as RunwayOptions);
    if (!report) return undefined;
    return { title: "How long the money lasts", html: prose(report.text) };
  }
  if (id === "signals") {
    const report = signalsReport(input);
    if (!report) return undefined;
    const rows = report.signals
      .map(
        (s) =>
          `<tr><td class="dir">${s.stronger ? "▲" : "▼"}</td><th>${esc(s.name)}</th><td>${esc(s.detail)}</td></tr>`,
      )
      .join("\n");
    const [scoreLine, , ...rest] = report.text.split("\n");
    const tail = rest.join("\n").split("\n\n").slice(-2).join("\n\n");
    return {
      title: "Is the business getting stronger or weaker",
      html: `<p class="headline">${esc(scoreLine)}</p>
<table class="signals">${rows}</table>
${prose(tail)}`,
    };
  }
  if (id === "accountant") {
    const questions = questionsForYourAccountant(input);
    return {
      title: "What to ask your accountant",
      html: `${questions
        .map(
          (q, i) => `<div class="question">
<p class="ask">${i + 1}. ${esc(q.ask)}</p>
<p class="why">Why this one: ${esc(q.why)}</p>
<p class="good"><b>A good answer</b> — ${esc(q.good)}</p>
</div>`,
        )
        .join("\n")}
<p class="note">Take this list into the meeting on paper. The point is not the questions, it is
being able to tell whether the answer was one.</p>`,
    };
  }
  return undefined;
}

/** The chapters, in reading order: what is wrong, what could go wrong, what to do. */
const CHAPTERS: ReportId[] = ["margin", "shock", "pricing", "runway", "signals", "accountant"];

/**
 * The report. One document, one price, every chapter the file can carry.
 *
 * This replaced six separate €9 documents after the founder read four of
 * them and said he would not pay for them. He was right: a single page
 * carrying a single computation is a fine chapter and a thin product, and a
 * machine that charges per formula feels like a fee schedule. The marginal
 * cost of a chapter is zero once the file is read, so the chapters travel
 * together and the price stays where it was.
 *
 * Chapters the file cannot carry are named at the end with what to send,
 * and sending it reissues the report for nothing. That is the honest
 * version of an upsell: the invoice does not grow, the report does.
 */
export function fullReport(
  input: FindingsInput,
  options: PaidOptions,
  meta: DocumentMeta,
): string {
  const supplied: Supplied = { input, cash: options.cash };
  const gates = new Map(offer(supplied).map((o) => [o.id, o]));

  const built: { title: string; html: string }[] = [];
  const missing: { question: string; needs: string; why: string }[] = [];

  for (const id of CHAPTERS) {
    const produced = chapter(id, input, options);
    if (produced) {
      built.push(produced);
      continue;
    }
    const definition = REPORTS.find((r) => r.id === id)!;
    const gate = gates.get(id);
    missing.push({
      question: definition.question,
      needs: definition.needs,
      why: gate?.because ?? "could not be produced from this file",
    });
  }

  const report = render(findAll(input));
  const chapters = built
    .map((c, i) => `<h2>${i + 1}. ${esc(c.title)}</h2>\n${c.html}`)
    .join("\n");

  const contents = built.map((c, i) => `${i + 1}. ${c.title}`).join(" — ");

  const more =
    missing.length > 0
      ? `<h2>What would make this report richer</h2>
<p>Your file could not carry ${missing.length === 1 ? "one chapter" : `${missing.length} chapters`}. That is a fact about the file, not the business — and adding
them later costs nothing: send the missing piece and we reissue this report, no new charge.</p>
<table class="offer">${missing
          .map(
            (m) =>
              `<tr><td>${esc(m.question)}</td><td class="why">${esc(m.needs)}</td></tr>`,
          )
          .join("\n")}</table>`
      : "";

  return frame({
    title: "What your figures say — the report",
    standfirst: `${built.length} chapters from one file: ${contents}.`,
    meta,
    free: false,
    body: `${portraitSection(input)}
<p class="headline">${esc(report.text.split("\n")[0])}</p>
${chapters}
${more}`,
  });
}
