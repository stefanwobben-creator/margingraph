/**
 * Turn a file that arrived at info@ into the reply, on one command.
 *
 *   npm run reply "~/Downloads/jaarrekening.xlsx" -- --name "Marijn"
 *
 * Prints a complete email, subject line first, ready to paste into the reply.
 * Three shapes, decided by the file and the flags:
 *
 *   - the file cannot be read     → the questions email, nobody charged
 *   - the file reads (default)    → the free email: portrait, teaser, the
 *                                   chapters, how to pay
 *   - --paid                      → the thank-you email that carries the
 *                                   report (generate it with npm run report,
 *                                   attach 01-report.html or its PDF)
 *
 * `npm run intake` stays the diagnostic view for us; this is the customer's
 * view. Both call the same engine, so they can never tell a different story.
 *
 * Known gap, on purpose: the scaffolding is English because every line the
 * engine produces is English. A Dutch sender gets a Dutch opening line typed
 * by a person, which for the first ten customers is a feature.
 *
 * All the intake flags work here too:
 *
 *   npm run reply accounts.xlsx -- --sheet "W&V" --cash 44237 --scale 1000
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { renderOffer, sellableCount } from "@/lib/reports/catalogue";
import { REPORT_PRICE, findAll, teaser } from "@/lib/reports/findings";
import { readSheet, type Sheet } from "@/lib/reports/intake";

/**
 * The live Mollie link, so the email that asks for money contains a way to
 * pay it. The env var wins when present (it is on Vercel); the fallback is
 * the same reusable link the site itself sends buyers to, which is public by
 * definition.
 */
const PAY_LINK =
  (process.env.NEXT_PUBLIC_MOLLIE_LINK_BUSINESS_VALUATION ?? "").trim() ||
  "https://payment-links.mollie.com/payment/qKYUfhSpJDa7aQbeSKWbq";

// --- flags, same dialect as intake.ts --------------------------------------

const argv = process.argv.slice(2);
const at = (name: string) => argv.indexOf(`--${name}`);
const text = (name: string) => {
  const i = at(name);
  return i >= 0 ? argv[i + 1] : undefined;
};
const num = (name: string) => {
  const value = text(name);
  return value === undefined ? undefined : Number(value);
};
const column = (name: string) => {
  const value = num(name);
  return value === undefined ? undefined : value - 1;
};

const consumed = new Set<number>();
argv.forEach((a, i) => {
  if (a.startsWith("--")) {
    consumed.add(i);
    consumed.add(i + 1);
  }
});
const file = argv.find((a, i) => !consumed.has(i));

if (!file) {
  console.error(
    "usage: npm run reply <file> [-- --name NAME --cash N --months N --paid margin,shock --sheet NAME --actual N --reference N --scale N]",
  );
  process.exit(1);
}

const CONVERTER = fileURLToPath(new URL("./sheet-to-rows.py", import.meta.url));

function grid(path: string): string {
  if (/\.json$/i.test(path)) return readFileSync(path, "utf8");
  const sheetName = text("sheet");
  try {
    return execFileSync(
      "python3",
      [CONVERTER, path, ...(sheetName ? ["--sheet", sheetName] : [])],
      { encoding: "utf8", maxBuffer: 256 * 1024 * 1024, stdio: ["ignore", "pipe", "pipe"] },
    );
  } catch (error) {
    const e = error as { stderr?: string; message?: string };
    console.error(`\n${(e.stderr || e.message || "the converter failed").trim()}\n`);
    process.exit(1);
  }
}

// --- read the file ----------------------------------------------------------

const raw = grid(file);
if (!raw.trim()) {
  console.error(`\n${file} produced nothing to read. Is it empty?\n`);
  process.exit(1);
}

const sheet = JSON.parse(raw) as Sheet;
const intake = readSheet(sheet, {
  actualColumn: column("actual"),
  referenceColumn: column("reference"),
  scale: num("scale"),
});

const name = text("name");
const greeting = name ? `Hi ${name},` : "Hello,";
const cash = num("cash");

const signature = [
  "Stefan Wobben",
  "margingraph.com — read by a person, deleted after",
].join("\n");

const email = (subject: string, body: string[]) => {
  console.log(`\nSUBJECT: ${subject}\n`);
  console.log("-".repeat(64));
  console.log([greeting, "", ...body, "", signature].join("\n"));
  console.log("-".repeat(64) + "\n");
};

// --- shape 1: the file refused ----------------------------------------------

if (!intake.readable) {
  email("One question before we can read your figures", [
    "Thanks for sending your figures. Before anything runs, there is something " +
      "we will not guess at:",
    "",
    ...intake.questions.map((q) => `  - ${q}`),
    "",
    "Reply in one line and we run the file the same day. Nothing is charged " +
      "until there is something worth charging for, and your file is deleted " +
      "after we are done either way.",
  ]);
  process.exit(0);
}

const input = intake.input!;
const findings = findAll(input);

// --- shape 3: the paid reply ------------------------------------------------

if (at("paid") >= 0) {
  email("Your report: what your figures say", [
    "Thank you — payment received. Your report is attached: every chapter " +
      "your file could carry, in one document.",
    "",
    "Two things worth knowing as you read it:",
    "",
    "  - Every amount has a Check line, so you can redo the arithmetic on " +
      "your own file in ten seconds. If a number does not survive that, " +
      "tell us and the report is free.",
    "  - The last page names the chapters your file could not carry, and " +
      "what to send to add them. Sending it reissues the report at no charge.",
    "",
    "Your file is now deleted from our side. Send next quarter's when it " +
      "exists — the comparison is where a report gets sharper.",
  ]);
  process.exit(0);
}

// --- shape 2: the free reply ------------------------------------------------

const free = teaser(findings, input);
const supplied = { input, cash };
const sellable = sellableCount(supplied);

const paying: string[] = [];
if (free.unlockable || sellable > 0) {
  paying.push(
    `The full report is €${REPORT_PRICE} — one document, every chapter above. Pay here and reply "paid":`,
    "",
    `  ${PAY_LINK}`,
    "",
  );
}

const decided =
  intake.notes.length > 0
    ? [
        "So you can check us — what we decided while reading your file:",
        "",
        ...intake.notes.map((n) => `  - ${n}`),
        "",
      ]
    : [];

email("What your file says", [
  "Thanks for sending your figures. We read them today. Here is what came " +
    "back — the part below is free, whatever you decide.",
  "",
  free.text.trimEnd(),
  "",
  "What this file can become:",
  "",
  renderOffer(supplied).trimEnd(),
  "",
  ...paying,
  ...decided,
  "Your file is not stored anywhere: it was read, this email was written, " +
    "and it will be deleted. If we found less than €90 worth acting on for a " +
    "report, that report is free and there is nothing to pay.",
]);
