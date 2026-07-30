/**
 * The report generator: one file in, two finished documents out.
 *
 *   npm run report "~/Downloads/jaarrekening.xlsx" -- --cash 44237 --name "Marijn"
 *
 * Writes, into a directory named after the source file:
 *
 *   00-free-what-your-figures-say.html   the free document: portrait, teaser,
 *                                        and the chapters their report holds
 *   01-report.html                       the report itself, €9: every chapter
 *                                        the file can carry, in one document
 *
 * Chapters the file cannot carry are named inside the report with what to
 * send, and the manifest printed at the end repeats them. The documents are
 * self-contained HTML, print-ready at A4: open one and press print for the
 * PDF, or attach the HTML as it is.
 *
 * All the intake flags work here too: --sheet, --actual, --reference,
 * --scale, plus --cash and --months for the runway chapter, --name for the
 * cover, and --out to choose the directory.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";

import { offer } from "@/lib/reports/catalogue";
import { freeDocument, fullReport } from "@/lib/reports/document";
import { readSheet, type Sheet } from "@/lib/reports/intake";

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
    "usage: npm run report <file.xlsx|.csv|.pdf|.json> [-- --cash N --months N --name NAME --out DIR --sheet NAME --actual N --reference N --scale N]",
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

if (!intake.readable) {
  console.log("\nWHAT WE WILL NOT GUESS AT\n");
  for (const q of intake.questions) console.log(`  - ${q}`);
  console.log("\nNo documents were produced, and nobody is charged. Answer the question and rerun.\n");
  process.exit(2);
}

const input = intake.input!;
const cash = num("cash");
const months = num("months");
const supplied = { input, cash };

const meta = {
  source: basename(file),
  date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
  recipient: text("name"),
};

const outDir =
  text("out") ?? join(process.cwd(), "reports-out", basename(file).replace(/\.[^.]+$/, ""));
mkdirSync(outDir, { recursive: true });

const written: string[] = [];

// The free document: the storefront.
const freePath = join(outDir, "00-free-what-your-figures-say.html");
writeFileSync(freePath, freeDocument(input, supplied, meta));
written.push(freePath);

// The report: one document, every chapter the file can carry.
const reportPath = join(outDir, "01-report.html");
writeFileSync(reportPath, fullReport(input, { cash, months }, meta));
written.push(reportPath);

// What the report could not carry, for the manifest.
const skipped = offer(supplied)
  .filter((o) => !o.sellable && !o.because?.includes("free"))
  .map((o) => ({ id: o.id as string, why: o.because ?? "" }));

console.log(`\nREAD "${sheet.name}"${intake.columns?.reference ? ` — ${intake.columns.actual.header} against ${intake.columns.reference.header}` : ""}\n`);
if (intake.notes.length) {
  for (const note of intake.notes) console.log(`  note: ${note}`);
  console.log("");
}
console.log("WRITTEN\n");
for (const path of written) console.log(`  ${path}`);
if (skipped.length) {
  console.log("\nCHAPTERS THIS FILE CANNOT CARRY\n");
  for (const s of skipped) console.log(`  ${s.id.padEnd(10)} ${s.why}`);
}
console.log(
  "\nOpen a document and print it for the PDF. The free one goes to the sender as is;\nthe report goes out after payment.\n",
);
